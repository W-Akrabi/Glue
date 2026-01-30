'use server';

import { auth } from '@/auth';
import { runSlaCheckJob } from '@/lib/sla';

type SlaState = {
  error?: string;
  success?: boolean;
  notified?: number;
  escalated?: number;
};

export async function runSlaCheck(_prevState: SlaState) {
  const session = await auth();
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

  if (session.user.role !== 'ADMIN') {
    return { error: 'Forbidden' };
  }

  const result = await runSlaCheckJob();
  return { success: true, notified: result.notified, escalated: result.escalated };
}
