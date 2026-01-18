import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limitParam = Number(searchParams.get('limit') ?? '50');
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 200) : 50;
  const cursor = searchParams.get('cursor') ?? undefined;

  const requests = await prisma.record.findMany({
    where: { organizationId: session.user.organizationId! },
    orderBy: { createdAt: 'desc' },
    take: limit,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      data: true,
      entityType: { select: { id: true, name: true, schema: true } },
      status: true,
      workflowInstance: { select: { currentStep: true, steps: { select: { id: true } } } },
      createdAt: true,
      createdBy: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  return NextResponse.json({ data: requests });
}
