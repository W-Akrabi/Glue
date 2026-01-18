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

  const record = await prisma.record.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId!,
    },
    select: {
      id: true,
      entityTypeId: true,
      data: true,
      entityType: { select: { id: true, name: true, schema: true, workflowDefinition: true } },
      status: true,
      workflowInstance: {
        include: {
          steps: {
            orderBy: { stepNumber: 'asc' },
            select: {
              id: true,
              stepNumber: true,
              status: true,
              approvedById: true,
              approvedAt: true,
              createdAt: true,
            },
          },
        },
      },
      createdAt: true,
      createdBy: { select: { id: true, name: true, email: true, role: true } },
      organization: { select: { id: true, name: true, createdAt: true } },
    },
  });

  if (!record) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const auditLogs = await prisma.auditLog.findMany({
    where: {
      entityType: record.entityTypeId,
      entityId: record.id,
    },
    take: auditLimit,
    include: { actor: { select: { id: true, name: true, email: true, role: true } } },
    orderBy: { timestamp: 'desc' },
  });

  return NextResponse.json({ data: { ...record, auditLogs } });
}
