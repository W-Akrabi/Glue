import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const auditLimitParam = Number(searchParams.get('auditLimit') ?? '50');
  const auditLimit = Number.isFinite(auditLimitParam)
    ? Math.min(Math.max(auditLimitParam, 1), 200)
    : 50;

  const { id } = await params;

  const request = await prisma.request.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId!,
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      currentStep: true,
      createdAt: true,
      createdBy: { select: { id: true, name: true, email: true, role: true } },
      organization: { select: { id: true, name: true, createdAt: true } },
      approvalSteps: {
        orderBy: { stepNumber: 'asc' },
        select: {
          id: true,
          stepNumber: true,
          requiredRole: true,
          status: true,
          approvedById: true,
          approvedAt: true,
          createdAt: true,
        },
      },
      auditLogs: {
        take: auditLimit,
        include: { actor: { select: { id: true, name: true, email: true, role: true } } },
        orderBy: { timestamp: 'desc' },
      },
    },
  });

  if (!request) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ data: request });
}
