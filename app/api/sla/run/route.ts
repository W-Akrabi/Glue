import { NextResponse } from 'next/server';
import { runSlaCheckJob } from '@/lib/sla';

export async function POST(request: Request) {
  const secret = process.env.SLA_CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'SLA_CRON_SECRET not configured' }, { status: 500 });
  }

  const headerSecret = request.headers.get('x-sla-cron-secret');
  if (headerSecret !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await runSlaCheckJob();
  return NextResponse.json({ success: true, ...result });
}
