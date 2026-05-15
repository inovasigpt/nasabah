"use client";

import { useState, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Save, RotateCcw, BrainCircuit } from "lucide-react";

const initialNodes: Node[] = [
  {
    id: "1",
    type: "input",
    position: { x: 250, y: 0 },
    data: { label: "Trigger: Transaction > Rp 10M" },
    style: { background: "#003366", color: "#fff", border: "1px solid #FFCC00", width: 200 },
  },
  {
    id: "2",
    position: { x: 100, y: 100 },
    data: { label: "Condition: IP Outside Indonesia" },
    style: { background: "#fff", border: "1px solid #f97316", width: 180 },
  },
  {
    id: "3",
    position: { x: 350, y: 100 },
    data: { label: "Condition: Account < 30 days old" },
    style: { background: "#fff", border: "1px solid #f97316", width: 180 },
  },
  {
    id: "4",
    type: "output",
    position: { x: 250, y: 220 },
    data: { label: "Action: Flag for Review" },
    style: { background: "#f97316", color: "#fff", border: "1px solid #c2410c", width: 180 },
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true, style: { stroke: "#003366" } },
  { id: "e1-3", source: "1", target: "3", animated: true, style: { stroke: "#003366" } },
  { id: "e2-4", source: "2", target: "4", animated: true, style: { stroke: "#f97316" } },
  { id: "e3-4", source: "3", target: "4", animated: true, style: { stroke: "#f97316" } },
];

export default function RulesPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: "#003366" } }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Configuration</h1>
        <p className="text-gray-500 mt-1">Visual rule builder for fraud detection logic</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden" style={{ height: 600 }}>
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-bi-navy" />
              <h2 className="font-semibold text-gray-900">Rule Canvas</h2>
              <Badge variant="info" className="text-xs">Draft</Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setNodes(initialNodes); setEdges(initialEdges); }}>
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
              <Button variant="outline" size="sm">
                <Play className="w-4 h-4 mr-1" />
                Test
              </Button>
              <Button size="sm">
                <Save className="w-4 h-4 mr-1" />
                Save Rule
              </Button>
            </div>
          </div>
          <div style={{ height: 540 }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              fitView
            >
              <Background color="#e2e8f0" gap={16} />
              <Controls />
              <MiniMap nodeColor={(node) => (node.style?.background as string) || "#003366"} />
            </ReactFlow>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Node Palette</h3>
            <div className="space-y-2">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors">
                <p className="text-xs font-medium text-blue-800">+ Trigger</p>
                <p className="text-xs text-blue-600">Transaction event</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200 cursor-pointer hover:bg-orange-100 transition-colors">
                <p className="text-xs font-medium text-orange-800">+ Condition</p>
                <p className="text-xs text-orange-600">IF logic check</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 transition-colors">
                <p className="text-xs font-medium text-green-800">+ Action</p>
                <p className="text-xs text-green-600">THEN execute</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Properties</h3>
            {selectedNode ? (
              <div className="space-y-2">
                <p className="text-xs text-gray-500">ID</p>
                <p className="text-sm font-mono text-gray-900">{selectedNode.id}</p>
                <p className="text-xs text-gray-500 mt-2">Label</p>
                <p className="text-sm text-gray-900">{selectedNode.data?.label as string}</p>
                <p className="text-xs text-gray-500 mt-2">Type</p>
                <Badge variant="info" className="text-xs">{selectedNode.type || "default"}</Badge>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Select a node to edit properties</p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Model Performance</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">Precision</span>
                  <span className="font-medium text-gray-900">87.4%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "87.4%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">Recall</span>
                  <span className="font-medium text-gray-900">92.1%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: "92.1%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">F1 Score</span>
                  <span className="font-medium text-gray-900">89.7%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: "89.7%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">False Positive Rate</span>
                  <span className="font-medium text-gray-900">4.2%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full" style={{ width: "4.2%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
