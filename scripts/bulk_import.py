#!/usr/bin/env python3
"""Bulk import analyzed properties from directory_v2.json into locations.json."""

import json
import os
import re
import random
import shutil
import sys
from pathlib import Path

# Try to import Pillow for webp conversion
try:
    from PIL import Image
    HAS_PILLOW = True
except ImportError:
    HAS_PILLOW = False
    print("Pillow not available — keeping original image formats")

# Paths
SCRIPT_DIR = Path(__file__).parent
REPO_ROOT = SCRIPT_DIR.parent
DIRECTORY_JSON = Path("/Users/joshuafeuer/.openclaw/workspace/property-pipeline/data/directory_v2.json")
PROPERTY_IMPORT_DIR = Path("/Users/joshuafeuer/.openclaw/workspace/property-import")
LOCATIONS_JSON = REPO_ROOT / "data" / "locations.json"
IMAGES_DIR = REPO_ROOT / "public" / "images" / "properties"

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".webp", ".png"}
MAX_IMAGES = 20


def make_slug(name: str) -> str:
    """Create a URL-safe slug from a property name.

    - Strip leading numbers and spaces/underscores
    - Lowercase
    - Replace non-alphanumeric with hyphens
    - Collapse multiple hyphens
    - Strip leading/trailing hyphens
    """
    # Replace underscores with spaces first
    s = name.replace("_", " ")
    # Strip leading digits and spaces
    s = re.sub(r"^[\d\s]+", "", s)
    # Lowercase
    s = s.lower()
    # Replace any non-alphanumeric character with a hyphen
    s = re.sub(r"[^a-z0-9]+", "-", s)
    # Collapse multiple hyphens
    s = re.sub(r"-+", "-", s)
    # Strip leading/trailing hyphens
    s = s.strip("-")
    return s


def clean_title(name: str) -> str:
    """Clean property name: strip leading numbers/spaces, title-case."""
    s = name.replace("_", " ")
    s = re.sub(r"^[\d\s]+", "", s)
    return s.strip().title()


def find_source_folder(folder_name: str) -> Path | None:
    """Find the matching folder in property-import/ (case-insensitive strip match)."""
    target = folder_name.strip()
    # Exact match first
    candidate = PROPERTY_IMPORT_DIR / target
    if candidate.exists():
        return candidate
    # Case-insensitive scan
    target_lower = target.lower()
    for entry in PROPERTY_IMPORT_DIR.iterdir():
        if entry.is_dir() and entry.name.lower() == target_lower:
            return entry
    return None


def get_image_files(folder: Path) -> list[Path]:
    """Return up to MAX_IMAGES image files from the folder, sorted."""
    images = sorted(
        p for p in folder.iterdir()
        if p.is_file() and p.suffix.lower() in IMAGE_EXTENSIONS
    )
    return images[:MAX_IMAGES]


def copy_image(src: Path, dest: Path, index: int) -> str | None:
    """Copy (and optionally convert) an image. Returns the relative web path or None on error."""
    if HAS_PILLOW:
        dest_filename = f"{index:02d}.webp"
        dest_path = dest / dest_filename
        try:
            with Image.open(src) as img:
                # Convert to RGB if needed (e.g. RGBA PNG)
                if img.mode in ("RGBA", "P", "LA"):
                    img = img.convert("RGB")
                img.save(dest_path, "WEBP", quality=85)
            return dest_path.name
        except Exception as e:
            print(f"  Warning: could not convert {src.name}: {e}, copying original")
            # Fall through to plain copy
    # Plain copy — keep original extension
    dest_filename = f"{index:02d}{src.suffix.lower()}"
    dest_path = dest / dest_filename
    shutil.copy2(src, dest_path)
    return dest_path.name


def build_location_entry(prop: dict, slug: str, image_paths: list[str]) -> dict:
    """Build a location entry matching the existing schema."""
    title = clean_title(prop.get("property_name", prop.get("folder_name", slug)))

    # Parse beds/baths safely
    try:
        bedrooms = int(prop.get("beds", 0) or 0)
    except (ValueError, TypeError):
        bedrooms = 0
    try:
        bathrooms = int(prop.get("baths", 0) or 0)
    except (ValueError, TypeError):
        bathrooms = 0

    amenities = prop.get("amenities", []) or []
    description = prop.get("description", "") or ""
    property_type = prop.get("property_type", "house") or "house"
    style = prop.get("style", "") or ""
    best_uses = prop.get("best_uses", []) or []

    price = random.randint(250, 600)

    web_images = [f"/images/properties/{slug}/{fname}" for fname in image_paths]

    return {
        "id": slug,
        "title": title,
        "slug": slug,
        "description": description,
        "address": "Los Angeles, CA",
        "city": "Los Angeles",
        "state": "CA",
        "price": price,
        "bedrooms": bedrooms,
        "bathrooms": bathrooms,
        "amenities": amenities,
        "images": web_images,
        "privacyLevel": "public",
        "featured": False,
        "sourceFolder": prop.get("folder_name", "").strip(),
        "propertyType": property_type,
        "style": style,
        "vibe": prop.get("vibe", ""),
        "bestUses": best_uses,
        "confidence": prop.get("confidence", ""),
        "photos": web_images,
        "neighborhood": "Los Angeles, CA",
    }


def main():
    # Load analyzed properties
    with open(DIRECTORY_JSON, "r") as f:
        analyzed = json.load(f)
    print(f"Loaded {len(analyzed)} analyzed properties from directory_v2.json")

    # Load existing locations
    with open(LOCATIONS_JSON, "r") as f:
        locations = json.load(f)
    existing_slugs = {loc.get("slug") or loc.get("id") for loc in locations}
    existing_source_folders = {loc.get("sourceFolder", "").strip().lower() for loc in locations}
    print(f"Found {len(locations)} existing locations")

    imported = 0
    skipped_no_folder = 0
    skipped_duplicate = 0

    for prop in analyzed:
        folder_name = prop.get("folder_name", "").strip()
        property_name = prop.get("property_name", folder_name).strip()

        # Skip if already imported (by source folder name)
        if folder_name.lower() in existing_source_folders:
            skipped_duplicate += 1
            continue

        slug = make_slug(property_name or folder_name)
        if not slug:
            slug = make_slug(folder_name)
        if not slug:
            print(f"  Skipping (no valid slug): {folder_name!r}")
            skipped_no_folder += 1
            continue

        # Ensure unique slug
        base_slug = slug
        counter = 2
        while slug in existing_slugs:
            slug = f"{base_slug}-{counter}"
            counter += 1

        # Find source folder
        source_folder = find_source_folder(folder_name)
        if source_folder is None:
            skipped_no_folder += 1
            continue

        # Get images
        image_files = get_image_files(source_folder)
        if not image_files:
            skipped_no_folder += 1
            continue

        # Create destination dir
        dest_dir = IMAGES_DIR / slug
        dest_dir.mkdir(parents=True, exist_ok=True)

        # Copy/convert images
        copied_names = []
        for idx, img_path in enumerate(image_files, start=1):
            fname = copy_image(img_path, dest_dir, idx)
            if fname:
                copied_names.append(fname)

        # Build and append entry
        entry = build_location_entry(prop, slug, copied_names)
        locations.append(entry)
        existing_slugs.add(slug)
        existing_source_folders.add(folder_name.lower())
        imported += 1

        if imported % 50 == 0:
            print(f"  Progress: {imported} imported so far...")

    # Write updated locations.json
    with open(LOCATIONS_JSON, "w") as f:
        json.dump(locations, f, indent=2)

    total = len(analyzed)
    print(f"\n--- Summary ---")
    print(f"Total analyzed:      {total}")
    print(f"Imported:            {imported}")
    print(f"Skipped (duplicate): {skipped_duplicate}")
    print(f"Skipped (no folder or images): {skipped_no_folder}")
    print(f"Total in locations.json now: {len(locations)}")


if __name__ == "__main__":
    main()
