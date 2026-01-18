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

  const requests = await prisma.request.findMany({
    where: { organizationId: session.user.organizationId! },
    orderBy: { createdAt: 'desc' },
    take: limit,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      currentStep: true,
      createdAt: true,
      createdBy: { select: { id: true, name: true, email: true, role: true } },
      _count: { select: { approvalSteps: true } },
    },
  });

  return NextResponse.json({ data: requests });
}
