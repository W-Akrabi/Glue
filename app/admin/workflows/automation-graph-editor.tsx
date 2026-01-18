"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  MiniMap,
} from "reactflow";
import type { Connection, Edge, Node, NodeChange, EdgeChange } from "reactflow";
import { Handle, Position } from "reactflow";
import "reactflow/dist/style.css";

import { useFormState } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { saveAutomationGraph } from "@/lib/actions/automation-graphs";
import { validateGraph } from "@/lib/automation/graph";

type AutomationGraphEditorProps = {
  initialName?: string;
  initialNodes?: Node[];
  initialEdges?: Edge[];
};

type ApprovalNodeData = {
  role: string;
};

const ROLE_OPTIONS = ["MEMBER", "APPROVER", "ADMIN"] as const;

function ApprovalStepNode({
  id,
  data,
  selected,
  onRoleChange,
}: {
  id: string;
  data: ApprovalNodeData;
  selected: boolean;
  onRoleChange: (nodeId: string, role: string) => void;
}) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-xs shadow-sm ${
        selected ? "border-emerald-400 bg-emerald-500/10" : "border-white/10 bg-black/60"
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-emerald-400 !border-emerald-200" />
      <p className="text-[11px] uppercase tracking-wide text-gray-400">Approval Step</p>
      <select
        className="mt-2 w-full rounded-md border border-white/10 bg-black px-2 py-1 text-xs text-white"
        value={data.role}
        onChange={(event) => onRoleChange(id, event.target.value)}
      >
        {ROLE_OPTIONS.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
      <Handle type="source" position={Position.Right} className="!bg-emerald-400 !border-emerald-200" />
    </div>
  );
}

export default function AutomationGraphEditor({
  initialName = "Main Automation",
  initialNodes = [],
  initialEdges = [],
}: AutomationGraphEditorProps) {
  const [nodes, setNodes] = useState<Node[]>(
    initialNodes.length
      ? initialNodes
      : [
          {
            id: "node-1",
            type: "approvalStep",
            position: { x: 0, y: 0 },
            data: { role: "APPROVER" },
          },
        ]
  );
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [name, setName] = useState(initialName);
  const [state, formAction] = useFormState(saveAutomationGraph, {});

  const validation = useMemo(() => validateGraph(nodes as any, edges as any), [nodes, edges]);
  const orderedNodes = useMemo(
    () => validation.order.map((id) => nodes.find((node) => node.id === id)).filter(Boolean),
    [validation.order, nodes]
  );

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge(connection, eds));
  }, []);

  const addNode = () => {
    const nextIndex = nodes.length + 1;
    setNodes((prev) => [
      ...prev,
      {
        id: `node-${Date.now()}`,
        type: "approvalStep",
        position: { x: 60 * nextIndex, y: 80 * nextIndex },
        data: { role: "APPROVER" },
      },
    ]);
  };

  const handleRoleChange = useCallback((nodeId: string, role: string) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: { ...(node.data as ApprovalNodeData), role },
            }
          : node
      )
    );
  }, []);

  const nodeTypes = useMemo(
    () => ({
      approvalStep: (props: { id: string; data: ApprovalNodeData; selected: boolean }) => (
        <ApprovalStepNode {...props} onRoleChange={handleRoleChange} />
      ),
    }),
    [handleRoleChange]
  );

  return (
    <ReactFlowProvider>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="nodes" value={JSON.stringify(nodes)} />
        <input type="hidden" name="edges" value={JSON.stringify(edges)} />

        <div className="flex flex-wrap items-center gap-3">
          <input
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-10 w-56 rounded-md border border-white/10 bg-black px-3 text-sm text-white"
            placeholder="Workflow name"
            required
          />
          <Button type="button" variant="secondary" onClick={addNode}>
            Add approval node
          </Button>
          <Button type="submit">Save graph</Button>
          {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          {state?.success ? <p className="text-sm text-emerald-300">Graph saved.</p> : null}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span
            className={`rounded-full border px-2 py-1 ${
              validation.valid
                ? "border-emerald-500/40 text-emerald-200"
                : "border-rose-500/40 text-rose-200"
            }`}
          >
            {validation.valid ? "Graph valid" : "Validation required"}
          </span>
          {!validation.valid ? (
            <span className="text-rose-200/80">{validation.errors.join(" ")}</span>
          ) : null}
        </div>

        <Card className="border-white/10 bg-black/40">
          <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
            <div className="h-[520px]">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
              >
                <Background color="rgba(255,255,255,0.08)" gap={24} />
                <MiniMap
                  nodeStrokeColor={(node) => (node.selected ? "#34d399" : "#334155")}
                  nodeColor={() => "#0f172a"}
                  maskColor="rgba(0,0,0,0.6)"
                />
                <Controls />
              </ReactFlow>
            </div>
            <div className="h-[520px] border-l border-white/10 p-4 text-xs text-gray-300">
              <p className="text-xs font-semibold text-gray-200">Execution order</p>
              <ol className="mt-3 space-y-2">
                {orderedNodes.length === 0 ? (
                  <li className="text-gray-500">No valid order yet.</li>
                ) : (
                  orderedNodes.map((node, index) => (
                    <li key={node?.id} className="flex items-center gap-2">
                      <span className="text-gray-500">{index + 1}.</span>
                      <span className="rounded-full border border-white/10 bg-black/40 px-2 py-1">
                        {node?.type}
                      </span>
                      <span className="text-gray-400">{node?.id}</span>
                    </li>
                  ))
                )}
              </ol>
            </div>
          </div>
        </Card>
      </form>
    </ReactFlowProvider>
  );
}
