import { existsSync, readFileSync, writeFileSync } from 'fs';
import { randomUUID } from 'crypto';
import { join } from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, isValidEmail, sanitizeEmail, sanitizeInput, writeAuditLog } from '@/lib/security';

const TEMPLATES_FILE = join(process.cwd(), 'data', 'email-templates.json');
const LOG_FILE = join(process.cwd(), 'data', 'outreach-log.json');

interface OutreachTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  sequence_order: number;
}

interface TemplatesFile {
  templates: Array<OutreachTemplate | Record<string, unknown>>;
}

interface OutreachLogEntry {
  id: string;
  templateId: string;
  recipientEmail: string;
  recipientName: string;
  propertyAddress: string;
  city: string;
  renderedSubject: string;
  renderedBody: string;
  loggedAt: string;
  status: 'queued';
}

function readTemplates(): TemplatesFile {
  if (!existsSync(TEMPLATES_FILE)) return { templates: [] };
  try {
    return JSON.parse(readFileSync(TEMPLATES_FILE, 'utf8')) as TemplatesFile;
  } catch {
    return { templates: [] };
  }
}

function readLog(): OutreachLogEntry[] {
  if (!existsSync(LOG_FILE)) return [];
  try {
    const parsed = JSON.parse(readFileSync(LOG_FILE, 'utf8'));
    return Array.isArray(parsed) ? (parsed as OutreachLogEntry[]) : [];
  } catch {
    return [];
  }
}

function writeLog(entries: OutreachLogEntry[]) {
  writeFileSync(LOG_FILE, JSON.stringify(entries, null, 2) + '\n', 'utf8');
}

function getOutreachTemplates(): OutreachTemplate[] {
  const { templates } = readTemplates();
  return templates.filter(
    (t): t is OutreachTemplate =>
      typeof t === 'object' &&
      t !== null &&
      'category' in t &&
      'sequence_order' in t &&
      typeof (t as OutreachTemplate).body === 'string'
  );
}

function applyMergeTags(text: string, tags: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => tags[key] ?? `{{${key}}}`);
}

export async function GET() {
  const templates = getOutreachTemplates();
  return NextResponse.json({ templates });
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  try {
    const body = (await request.json()) as Record<string, unknown>;

    const templateId = sanitizeInput(String(body.templateId || '')).slice(0, 80);
    const recipientEmail = sanitizeEmail(String(body.recipientEmail || ''));
    const recipientName = sanitizeInput(String(body.recipientName || '')).slice(0, 120);
    const propertyAddress = sanitizeInput(String(body.propertyAddress || '')).slice(0, 200);
    const city = sanitizeInput(String(body.city || '')).slice(0, 80);

    if (!templateId || !recipientEmail || !recipientName) {
      return NextResponse.json(
        { error: 'templateId, recipientEmail, and recipientName are required.' },
        { status: 400 }
      );
    }

    if (!isValidEmail(recipientEmail)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    const templates = getOutreachTemplates();
    const template = templates.find((t) => t.id === templateId);

    if (!template) {
      return NextResponse.json({ error: 'Template not found.' }, { status: 404 });
    }

    const mergeTags: Record<string, string> = {
      name: recipientName,
      property_address: propertyAddress,
      city,
    };

    const renderedSubject = applyMergeTags(template.subject, mergeTags);
    const renderedBody = applyMergeTags(template.body, mergeTags);

    const entry: OutreachLogEntry = {
      id: `outreach_${randomUUID().slice(0, 8)}`,
      templateId,
      recipientEmail,
      recipientName,
      propertyAddress,
      city,
      renderedSubject,
      renderedBody,
      loggedAt: new Date().toISOString(),
      status: 'queued',
    };

    const log = readLog();
    log.push(entry);
    writeLog(log);

    writeAuditLog('outreach.logged', {
      id: entry.id,
      templateId,
      recipientName,
      city,
    });

    return NextResponse.json({ ok: true, id: entry.id }, { status: 201 });
  } catch (error) {
    writeAuditLog('outreach.error', { ip, error: error instanceof Error ? error.message : 'unknown_error' });
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
