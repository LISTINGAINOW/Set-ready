import { NextRequest, NextResponse } from "next/server";
import locations from "@/data/locations.json";

const GENERIC_TERMS = new Set([
  "location",
  "locations",
  "place",
  "places",
  "space",
  "spot",
  "need",
  "looking",
  "want",
  "something",
  "find",
  "show",
  "with",
  "for",
  "near",
  "around",
  "private",
  "production",
  "shoot",
  "content",
  "photo",
  "video",
]);

const keywordAliases: Record<string, string[]> = {
  malibu: ["malibu"],
  venice: ["venice", "venice beach"],
  hollywood: ["hollywood", "west hollywood", "weho"],
  topanga: ["topanga"],
  dtla: ["dtla", "downtown la", "downtown los angeles"],
  losangeles: ["los angeles", "la"],
  brooklyn: ["brooklyn"],
  joshuatree: ["joshua tree", "desert"],
  pool: ["pool", "swimming pool", "rooftop pool"],
  ocean: ["ocean", "ocean view", "beach", "beachfront", "shore", "waterfront", "coast", "sunset views"],
  modern: ["modern", "minimalist", "mid-century", "mid century", "designer"],
  luxury: ["luxury", "luxurious", "high-end", "upscale", "premium"],
  private: ["private", "secluded", "discrete", "discreet", "nda", "confidential"],
  photoshoot: ["photo shoot", "photo shoots", "photoshoot", "stills", "editorial", "content day"],
  videoproduction: ["video production", "video shoot", "motion", "film"],
  commercial: ["commercial", "advertisement", "brand", "campaign"],
  lifestyle: ["lifestyle", "fashion", "wellness", "travel"],
  studio: ["studio", "loft"],
  house: ["house", "home", "villa", "bungalow", "cabin", "penthouse"],
  warehouse: ["warehouse", "industrial"],
  naturalLight: ["natural light", "bright", "sunny"],
  parking: ["parking", "cars", "crew parking"],
  kitchen: ["kitchen"],
  rooftop: ["rooftop", "penthouse"],
};

type LocationRecord = (typeof locations)[number];

type ParsedRequest = {
  normalized: string;
  matchedKeywords: string[];
  significantTerms: string[];
};

function normalize(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function collectHaystack(location: LocationRecord) {
  return normalize(
    [
      location.title,
      location.city,
      location.state,
      location.description,
      location.propertyType,
      location.privacyTier,
      location.neighborhood,
      ...(location.amenities || []),
      ...(location.contentTypes || []),
      ...(location.specialFeatures || []),
      ...(location.tags || []),
    ].join(" ")
  );
}

function parseUserMessage(message: string): ParsedRequest {
  const normalized = normalize(message);
  const matchedKeywords = Object.entries(keywordAliases)
    .filter(([, aliases]) => aliases.some((alias) => normalized.includes(normalize(alias))))
    .map(([keyword]) => keyword);

  const significantTerms = normalized
    .split(" ")
    .filter((term) => term.length > 2 && !GENERIC_TERMS.has(term));

  return { normalized, matchedKeywords, significantTerms };
}

function scoreLocation(location: LocationRecord, parsed: ParsedRequest) {
  const haystack = collectHaystack(location);
  const city = normalize(location.city);
  const propertyType = normalize(location.propertyType);
  let score = 0;

  for (const keyword of parsed.matchedKeywords) {
    const aliases = keywordAliases[keyword] || [keyword];
    if (aliases.some((alias) => haystack.includes(normalize(alias)))) {
      score += 5;
    }
  }

  for (const term of parsed.significantTerms) {
    if (haystack.includes(term)) {
      score += 2;
    }
  }

  if (parsed.normalized.includes(city)) {
    score += 20;
  }

  if (parsed.normalized.includes(propertyType)) {
    score += 6;
  }

  if (parsed.normalized.includes("house") && ["house", "villa", "bungalow", "cabin", "penthouse"].includes(propertyType)) {
    score += 6;
  }

  if (parsed.normalized.includes("studio") && propertyType === "studio") {
    score += 6;
  }

  if (parsed.normalized.includes("private") || parsed.normalized.includes("discreet") || parsed.normalized.includes("secluded")) {
    if (location.privacyTier !== "Public") {
      score += 4;
    }
  }

  if (parsed.normalized.includes("ocean") || parsed.normalized.includes("shore") || parsed.normalized.includes("beach")) {
    if (/malibu|venice|ocean|beach|coast/.test(haystack)) {
      score += 3;
    }
  }

  if (parsed.normalized.includes("modern") || parsed.normalized.includes("minimalist") || parsed.normalized.includes("luxury")) {
    if (/modern|minimalist|luxury|upscale|designer/.test(haystack)) {
      score += 3;
    }
  }

  return score;
}

function summarize(location: LocationRecord) {
  return {
    id: location.id,
    title: location.title,
    description: location.description,
    city: location.city,
    privacyTier: location.privacyTier,
    price: location.price,
    link: `/locations/${location.id}`,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = String(body?.message || "").trim();

    if (!message) {
      return NextResponse.json({ message: "Tell me a little about the kind of location you want.", matches: [], needsMoreDetail: true }, { status: 400 });
    }

    const parsed = parseUserMessage(message);

    if (parsed.matchedKeywords.length === 0 && parsed.significantTerms.length < 2) {
      return NextResponse.json({
        message: "Can you tell me more about what you're looking for? Area, privacy level, style, or amenities like pool, beach access, or parking all help.",
        matches: [],
        needsMoreDetail: true,
      });
    }

    const ranked = locations
      .map((location) => ({ ...summarize(location), score: scoreLocation(location, parsed) }))
      .sort((a, b) => b.score - a.score || a.price - b.price);

    const strongMatches = ranked.filter((location) => location.score > 0).slice(0, 3);

    if (strongMatches.length === 0) {
      const suggestions = ranked.slice(0, 3);
      return NextResponse.json({
        message: "I couldn't find exact matches, but here are some suggestions that are still worth a look. If you want tighter results, give me an area, vibe, or must-have amenity.",
        matches: suggestions,
        fallback: true,
      });
    }

    return NextResponse.json({
      message: `I found ${strongMatches.length} location${strongMatches.length > 1 ? "s" : ""} that match your needs. Would you like more details on any of these?`,
      matches: strongMatches,
    });
  } catch (error) {
    return NextResponse.json({ message: "I hit a snag while searching locations.", matches: [] }, { status: 500 });
  }
}
