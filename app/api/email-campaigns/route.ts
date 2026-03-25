import { NextRequest, NextResponse } from 'next/server';
import {
  applyEmailCampaignRateLimit,
  getAllCampaignTemplates,
  getCampaignTemplates,
  sanitizeCampaignName,
  upsertCampaignTemplate,
} from '@/lib/email-campaigns';
import { getClientIp, validateCsrf, writeAuditLog } from '@/lib/security';

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rateLimit = applyEmailCampaignRateLimit(ip);

  if (rateLimit.blocked) {
    writeAuditLog('email_campaigns.rate_limited', { ip, resetInMs: rateLimit.resetInMs, method: 'GET' });
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.max(1, Math.ceil(rateLimit.resetInMs / 1000))),
        },
      }
    );
  }

  const campaignParam = request.nextUrl.searchParams.get('campaign');
  const activeOnlyParam = request.nextUrl.searchParams.get('activeOnly');
  const activeOnly = activeOnlyParam === 'true';

  if (!campaignParam) {
    return NextResponse.json({ campaigns: getAllCampaignTemplates() });
  }

  const campaign = sanitizeCampaignName(campaignParam);
  if (!campaign) {
    return NextResponse.json({ error: 'Invalid campaign.' }, { status: 400 });
  }

  return NextResponse.json({ campaigns: getCampaignTemplates(campaign, activeOnly) });
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rateLimit = applyEmailCampaignRateLimit(ip);

  if (rateLimit.blocked) {
    writeAuditLog('email_campaigns.rate_limited', { ip, resetInMs: rateLimit.resetInMs, method: 'POST' });
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.max(1, Math.ceil(rateLimit.resetInMs / 1000))),
        },
      }
    );
  }

  try {
    if (!validateCsrf(request)) {
      writeAuditLog('email_campaigns.csrf_failed', { ip });
      return NextResponse.json({ error: 'Security validation failed. Refresh and try again.' }, { status: 403 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const template = upsertCampaignTemplate({
      campaign: typeof body.campaign === 'string' ? body.campaign : '',
      sequence: Number(body.sequence),
      subject: typeof body.subject === 'string' ? body.subject : '',
      body: typeof body.body === 'string' ? body.body : '',
      sendDelay: typeof body.sendDelay === 'string' ? body.sendDelay : '',
      active: typeof body.active === 'boolean' ? body.active : true,
    });

    writeAuditLog('email_campaigns.template_saved', {
      ip,
      campaign: template.campaign,
      sequence: template.sequence,
      active: template.active,
    });

    return NextResponse.json({ ok: true, template }, { status: 201 });
  } catch (error) {
    writeAuditLog('email_campaigns.error', { ip, error: error instanceof Error ? error.message : 'unknown_error' });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to save email campaign template.' },
      { status: 400 }
    );
  }
}
