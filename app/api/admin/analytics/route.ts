import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

function checkAuth(request: NextRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  const auth = request.headers.get('authorization');
  return auth === `Bearer ${adminPassword}`;
}

function groupByKey(
  arr: Record<string, unknown>[],
  key: string
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const item of arr) {
    const val = item[key] ? String(item[key]) : 'Unknown';
    result[val] = (result[val] ?? 0) + 1;
  }
  return result;
}

function groupByMonth(dates: string[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const dateStr of dates) {
    const month = dateStr.slice(0, 7);
    result[month] = (result[month] ?? 0) + 1;
  }
  return result;
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    const [
      submissionsResult,
      inquiriesResult,
      recentSubmissionsResult,
      recentInquiriesResult,
    ] = await Promise.all([
      supabase
        .from('listing_submissions')
        .select('id, status, city, state, title, created_at'),
      supabase
        .from('inquiries')
        .select(
          'id, production_type, preferred_city, name, created_at, property_id'
        ),
      supabase
        .from('listing_submissions')
        .select('id, title, city, state, status, created_at')
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('inquiries')
        .select('id, name, production_type, preferred_city, created_at')
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    const submissions = (submissionsResult.data ?? []) as Record<
      string,
      unknown
    >[];
    const inquiries = (inquiriesResult.data ?? []) as Record<string, unknown>[];
    const recentSubmissions = (recentSubmissionsResult.data ?? []) as Record<
      string,
      unknown
    >[];
    const recentInquiries = (recentInquiriesResult.data ?? []) as Record<
      string,
      unknown
    >[];

    // Core counts
    const totalProperties = submissions.length;
    const totalInquiries = inquiries.length;
    const pendingReviews = submissions.filter(
      (s) => s.status === 'pending_review'
    ).length;
    const approvedCount = submissions.filter(
      (s) => s.status === 'approved'
    ).length;
    const conversionRate =
      totalProperties > 0
        ? Math.round((approvedCount / totalProperties) * 100)
        : 0;

    // Status breakdown
    const statusBreakdown = groupByKey(submissions, 'status');

    // Submissions over time (by month)
    const submissionsByMonth = groupByMonth(
      submissions.map((s) => String(s.created_at ?? ''))
    );

    // Inquiries by production type
    const inquiriesByProductionType = groupByKey(inquiries, 'production_type');

    // Inquiries by preferred city
    const inquiriesByCity = groupByKey(inquiries, 'preferred_city');

    // Top 5 markets by inquiry volume
    const topCities = Object.entries(inquiriesByCity)
      .filter(([city]) => city !== 'Unknown')
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([city, count]) => ({ city, count }));

    // Recent activity — merge submissions + inquiries, sort by date
    type ActivityItem = {
      type: string;
      description: string;
      timestamp: string;
      id: string;
    };

    const activityFromSubmissions: ActivityItem[] = recentSubmissions.map(
      (s) => {
        const status = String(s.status ?? '');
        const title = String(s.title ?? 'Untitled');
        const loc =
          s.city && s.state ? ` (${s.city}, ${s.state})` : s.city ? ` (${s.city})` : '';
        const typeMap: Record<string, string> = {
          pending_review: 'new_submission',
          approved: 'approved',
          rejected: 'rejected',
          changes_requested: 'submission_update',
        };
        const descMap: Record<string, string> = {
          pending_review: `New listing submitted: ${title}${loc}`,
          approved: `Listing approved: ${title}${loc}`,
          rejected: `Listing rejected: ${title}${loc}`,
          changes_requested: `Changes requested: ${title}${loc}`,
        };
        return {
          type: typeMap[status] ?? 'submission_update',
          description: descMap[status] ?? `Listing updated: ${title}${loc}`,
          timestamp: String(s.created_at ?? ''),
          id: String(s.id ?? ''),
        };
      }
    );

    const activityFromInquiries: ActivityItem[] = recentInquiries.map((i) => ({
      type: 'new_inquiry',
      description: `New inquiry from ${String(i.name ?? 'Anonymous')}${i.production_type ? ` (${i.production_type})` : ''}${i.preferred_city ? ` in ${i.preferred_city}` : ''}`,
      timestamp: String(i.created_at ?? ''),
      id: String(i.id ?? ''),
    }));

    const recentActivity = [
      ...activityFromSubmissions,
      ...activityFromInquiries,
    ]
      .filter((a) => a.timestamp)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 10);

    return NextResponse.json({
      stats: {
        totalProperties,
        totalInquiries,
        pendingReviews,
        conversionRate,
      },
      statusBreakdown,
      submissionsByMonth,
      inquiriesByProductionType,
      inquiriesByCity,
      topCities,
      recentActivity,
    });
  } catch (err) {
    console.error('Analytics API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
