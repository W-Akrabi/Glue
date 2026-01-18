'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { GraphEdge, GraphNode, validateGraph } from '@/lib/automation/graph';

type AutomationGraphState = {
  error?: string;
  success?: boolean;
};

export async function saveAutomationGraph(
  _prevState: AutomationGraphState,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

  if (session.user.role !== 'ADMIN') {
    return { error: 'Forbidden' };
  }

  const name = String(formData.get('name') || '').trim();
  const rawNodes = String(formData.get('nodes') || '[]');
  const rawEdges = String(formData.get('edges') || '[]');

  if (!name) {
    return { error: 'Name is required' };
  }

  let nodes: GraphNode[] = [];
  let edges: GraphEdge[] = [];
  try {
    nodes = JSON.parse(rawNodes) as GraphNode[];
    edges = JSON.parse(rawEdges) as GraphEdge[];
  } catch {
    return { error: 'Invalid graph payload' };
  }

  if (!Array.isArray(nodes) || !Array.isArray(edges)) {
    return { error: 'Graph payload must be arrays' };
  }

  const validation = validateGraph(nodes, edges);
  if (!validation.valid) {
    return { error: validation.errors.join(' ') };
  }

  await prisma.workflowGraph.upsert({
    where: {
      organizationId_name: {
        organizationId: session.user.organizationId!,
        name,
      },
    },
    update: {
      nodes,
      edges,
      version: { increment: 1 },
    },
    create: {
      organizationId: session.user.organizationId!,
      name,
      nodes,
      edges,
    },
  });

  revalidatePath('/admin/workflows');

  return { success: true };
}
