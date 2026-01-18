export type GraphNode = {
  id: string;
  type: string;
  position?: { x: number; y: number };
  data?: Record<string, unknown>;
};

export type GraphEdge = {
  id?: string;
  source: string;
  target: string;
  sourcePort?: string;
  targetPort?: string;
};

export type GraphValidationResult = {
  valid: boolean;
  errors: string[];
  order: string[];
};

export function validateGraph(nodes: GraphNode[], edges: GraphEdge[]): GraphValidationResult {
  const errors: string[] = [];
  const nodeIds = new Set(nodes.map((node) => node.id));

  if (nodes.length === 0) {
    errors.push("Graph must contain at least one node.");
    return { valid: false, errors, order: [] };
  }

  for (const edge of edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      errors.push(`Edge references missing node: ${edge.source} -> ${edge.target}`);
    }
  }

  const incoming = new Map<string, number>();
  const outgoing = new Map<string, string[]>();
  nodes.forEach((node) => {
    incoming.set(node.id, 0);
    outgoing.set(node.id, []);
  });

  for (const edge of edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      continue;
    }
    incoming.set(edge.target, (incoming.get(edge.target) || 0) + 1);
    outgoing.get(edge.source)?.push(edge.target);
  }

  const queue: string[] = [];
  incoming.forEach((count, nodeId) => {
    if (count === 0) {
      queue.push(nodeId);
    }
  });

  const order: string[] = [];
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    order.push(nodeId);
    const neighbors = outgoing.get(nodeId) || [];
    for (const neighbor of neighbors) {
      const nextCount = (incoming.get(neighbor) || 0) - 1;
      incoming.set(neighbor, nextCount);
      if (nextCount === 0) {
        queue.push(neighbor);
      }
    }
  }

  if (order.length !== nodes.length) {
    errors.push("Graph contains a cycle or disconnected loop.");
  }

  return { valid: errors.length === 0, errors, order };
}
