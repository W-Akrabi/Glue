'use server';

import { prisma } from '@/lib/prisma';
import { GraphNode, validateGraph } from '@/lib/automation/graph';

type AutomationEvent = 'record.created' | 'record.approved' | 'record.rejected';

export async function runAutomationGraph(params: {
  organizationId: string;
  recordId: string;
  actorId: string;
  event: AutomationEvent;
}) {
  const workflowGraph = await prisma.workflowGraph.findFirst({
    where: { organizationId: params.organizationId },
    orderBy: { updatedAt: 'desc' },
  });

  if (!workflowGraph) {
    return;
  }

  const nodes = Array.isArray(workflowGraph.nodes) ? (workflowGraph.nodes as GraphNode[]) : [];
  const edges = Array.isArray(workflowGraph.edges) ? workflowGraph.edges : [];

  const validation = validateGraph(nodes, edges as any);
  if (!validation.valid) {
    return;
  }

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  for (const nodeId of validation.order) {
    const node = nodeMap.get(nodeId);
    if (!node) {
      continue;
    }

    if (node.type === 'approvalStep') {
      const role = typeof node.data?.role === 'string' ? node.data?.role : undefined;
      await prisma.auditLog.create({
        data: {
          entityType: 'AUTOMATION',
          entityId: params.recordId,
          action: 'NODE_EXECUTED',
          actorId: params.actorId,
          metadata: {
            graphId: workflowGraph.id,
            graphName: workflowGraph.name,
            nodeId: node.id,
            nodeType: node.type,
            role,
            event: params.event,
          },
        },
      });
    }
  }
}
