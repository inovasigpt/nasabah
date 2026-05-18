"use client";

import { useState, useCallback, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Play,
  Save,
  RotateCcw,
  BrainCircuit,
  Plus,
  Trash2,
  List,
  Settings,
  AlertTriangle,
  Snowflake,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type {
  RuleDefinition,
  Severity,
  TriggerType,
  ActionType,
  ConditionConfig,
  TriggerConfig,
  ActionConfig,
  SavedRule,
} from "@/types/rules";
import {
  TRIGGER_OPTIONS,
  CONDITION_FIELDS,
  OPERATOR_LABELS,
  ACTION_OPTIONS,
} from "@/types/rules";

function buildFlowFromDefinition(def: RuleDefinition): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const triggerId = "trigger-1";
  nodes.push({
    id: triggerId,
    type: "input",
    position: { x: 250, y: 0 },
    data: { label: `Trigger: ${def.trigger.label}`, type: "trigger", definition: def.trigger },
    style: { background: "#003366", color: "#fff", border: "1px solid #FFCC00", width: 220 },
  });

  let prevConditionId = triggerId;
  def.conditions.conditions.forEach((cond, i) => {
    const condId = `cond-${cond.id}`;
    const x = i % 2 === 0 ? 100 : 350;
    const y = 120 + Math.floor(i / 2) * 100;
    nodes.push({
      id: condId,
      position: { x, y },
      data: { label: `Condition: ${cond.label}`, type: "condition", definition: cond },
      style: { background: "#fff", border: "1px solid #f97316", width: 200 },
    });
    edges.push({
      id: `e-${prevConditionId}-${condId}`,
      source: prevConditionId,
      target: condId,
      animated: true,
      style: { stroke: "#003366" },
      sourceHandle: i === 0 ? undefined : "bottom",
    });
    prevConditionId = condId;
  });

  const actionId = "action-1";
  const actionY = 120 + Math.max(0, def.conditions.conditions.length - 1) * 100 + 100;
  nodes.push({
    id: actionId,
    type: "output",
    position: { x: 250, y: actionY },
    data: { label: `Action: ${def.action.label}`, type: "action", definition: def.action },
    style: {
      background: def.action.type === "AUTO_FREEZE" ? "#dc2626" : "#f97316",
      color: "#fff",
      border: `1px solid ${def.action.type === "AUTO_FREEZE" ? "#b91c1c" : "#c2410c"}`,
      width: 220,
    },
  });

  if (def.conditions.conditions.length === 0) {
    edges.push({
      id: `e-${triggerId}-${actionId}`,
      source: triggerId,
      target: actionId,
      animated: true,
      style: { stroke: "#003366" },
    });
  } else {
    const lastCondId = `cond-${def.conditions.conditions[def.conditions.conditions.length - 1].id}`;
    edges.push({
      id: `e-${lastCondId}-${actionId}`,
      source: lastCondId,
      target: actionId,
      animated: true,
      style: { stroke: "#003366" },
    });
  }

  return { nodes, edges };
}

function buildDefinitionFromFlow(nodes: Node[], edges: Edge[]): RuleDefinition {
  const triggerNode = nodes.find((n) => n.data?.type === "trigger");
  const conditionNodes = nodes.filter((n) => n.data?.type === "condition");
  const actionNode = nodes.find((n) => n.data?.type === "action");

  const trigger: TriggerConfig = (triggerNode?.data?.definition as TriggerConfig) || {
    type: "TRANSACTION_EVENT",
    label: "Transaction Event",
  };

  const conditions: ConditionConfig[] = conditionNodes
    .map((n) => n.data?.definition as ConditionConfig | undefined)
    .filter((d): d is ConditionConfig => d !== undefined && "id" in d);

  const action: ActionConfig = (actionNode?.data?.definition as ActionConfig) || {
    type: "FLAG_FOR_REVIEW",
    label: "Flag for Review",
  };

  return {
    trigger,
    conditions: { operator: "AND", conditions },
    action,
  };
}

const EMPTY_DEFINITION: RuleDefinition = {
  trigger: { type: "TRANSACTION_EVENT", label: "Transaction Event" },
  conditions: { operator: "AND", conditions: [] },
  action: { type: "FLAG_FOR_REVIEW", label: "Flag for Review" },
};

export default function RulesPage() {
  const [savedRules, setSavedRules] = useState<SavedRule[]>([]);
  const [selectedRuleId, setSelectedRuleId] = useState<number | null>(null);
  const [ruleName, setRuleName] = useState("New Rule");
  const [ruleDesc, setRuleDesc] = useState("");
  const [ruleSeverity, setRuleSeverity] = useState<Severity>("MEDIUM");
  const [ruleIsActive, setRuleIsActive] = useState(true);
  const [showSavedList, setShowSavedList] = useState(true);
  const [testResult, setTestResult] = useState<{ matched: boolean; explanation: string } | null>(null);
  const [currentDefinition, setCurrentDefinition] = useState<RuleDefinition>(EMPTY_DEFINITION);

  const { nodes: flowNodes, edges: flowEdges } = buildFlowFromDefinition(currentDefinition);
  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = buildFlowFromDefinition(currentDefinition);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [currentDefinition]);

  useEffect(() => {
    fetchRules();
  }, []);

  async function fetchRules() {
    try {
      const res = await fetch("/api/rules");
      const data = await res.json();
      if (data.rules) setSavedRules(data.rules);
    } catch (e) {
      console.error("Failed to fetch rules", e);
    }
  }

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: "#003366" } }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  function addNode(type: "trigger" | "condition" | "action") {
    if (type === "trigger") {
      setCurrentDefinition((prev) => ({
        ...prev,
        trigger: { type: TRIGGER_OPTIONS[0].value, label: TRIGGER_OPTIONS[0].label },
      }));
    } else if (type === "condition") {
      const newCond: ConditionConfig = {
        id: `c${Date.now()}`,
        source: "TRANSACTION",
        field: "amount",
        operator: "GT",
        value: "",
        label: "New Condition",
      };
      setCurrentDefinition((prev) => ({
        ...prev,
        conditions: {
          ...prev.conditions,
          conditions: [...prev.conditions.conditions, newCond],
        },
      }));
    } else if (type === "action") {
      setCurrentDefinition((prev) => ({
        ...prev,
        action: { type: ACTION_OPTIONS[0].value, label: ACTION_OPTIONS[0].label },
      }));
    }
  }

  function updateCondition(condId: string, updates: Partial<ConditionConfig>) {
    setCurrentDefinition((prev) => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        conditions: prev.conditions.conditions.map((c) =>
          c.id === condId ? { ...c, ...updates } : c
        ),
      },
    }));
  }

  function removeCondition(condId: string) {
    setCurrentDefinition((prev) => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        conditions: prev.conditions.conditions.filter((c) => c.id !== condId),
      },
    }));
    setTestResult(null);
  }

  function generateConditionLabel(cond: ConditionConfig): string {
    const fieldInfo = CONDITION_FIELDS.find((f) => f.value === cond.field && f.source === cond.source);
    const opLabel = OPERATOR_LABELS[cond.operator];
    const fieldLabel = fieldInfo?.label || cond.field;
    return `${fieldLabel} ${opLabel} ${cond.value}`;
  }

  async function handleSave() {
    const definition = buildDefinitionFromFlow(nodes, edges);
    const payload = {
      name: ruleName,
      description: ruleDesc || null,
      severity: ruleSeverity,
      logicJson: definition,
      isActive: ruleIsActive,
    };

    try {
      const res = selectedRuleId
        ? await fetch(`/api/rules/${selectedRuleId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/rules", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      const data = await res.json();
      if (data.rule) {
        setSelectedRuleId(data.rule.id);
        setRuleName(data.rule.name);
        await fetchRules();
      }
    } catch (e) {
      console.error("Failed to save rule", e);
    }
  }

  async function handleTest() {
    const definition = buildDefinitionFromFlow(nodes, edges);
    const mockContext = {
      amount: 15000000,
      channel: "Internet Banking",
      locationIp: "202.79.167.5",
      deviceId: "device-new-001",
      isWeekend: true,
      isOffHours: false,
      velocity: 5,
      sameRecipientCount: 3,
      accountAge: 10,
      riskScore: 45,
      accountStatus: "ACTIVE",
      balanceDrop: 60,
      hasOpenComplaint: false,
      complaintCategory: "PHISHING",
      complaintSentiment: "Negative",
      sameIpAsFraud: false,
      sameDeviceAsFraud: true,
      connectedToFraud: 0,
    };

    try {
      const res = await fetch("/api/rules/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logicJson: definition, context: mockContext }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (e) {
      console.error("Failed to test rule", e);
    }
  }

  function handleReset() {
    setCurrentDefinition(EMPTY_DEFINITION);
    setSelectedRuleId(null);
    setRuleName("New Rule");
    setRuleDesc("");
    setRuleSeverity("MEDIUM");
    setRuleIsActive(true);
    setTestResult(null);
    setSelectedNode(null);
  }

  function loadRule(rule: SavedRule) {
    setSelectedRuleId(rule.id);
    setRuleName(rule.name);
    setRuleDesc(rule.description || "");
    setRuleSeverity(rule.severity as Severity);
    setRuleIsActive(rule.isActive);
    setCurrentDefinition(rule.logicJson as unknown as RuleDefinition);
    setTestResult(null);
    setShowSavedList(false);
  }

  async function deleteRule(id: number) {
    if (!confirm("Delete this rule permanently?")) return;
    try {
      const res = await fetch(`/api/rules/${id}`, { method: "DELETE" });
      if (res.ok) {
        if (selectedRuleId === id) handleReset();
        await fetchRules();
      }
    } catch (e) {
      console.error("Failed to delete rule", e);
    }
  }

  const conditionFieldOptions = CONDITION_FIELDS;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Configuration</h1>
          <p className="text-gray-500 mt-1">Visual rule builder for fraud detection logic</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowSavedList(!showSavedList)}>
            <List className="w-4 h-4 mr-1" />
            Rules
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Saved Rules Sidebar */}
        {showSavedList && (
          <div className="lg:col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Saved Rules</h3>
              <Badge variant="info" className="text-xs">{savedRules.length}</Badge>
            </div>
            <Button size="sm" className="w-full" onClick={handleReset}>
              <Plus className="w-4 h-4 mr-1" />
              New Rule
            </Button>
            {savedRules.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">No rules saved yet</p>
            )}
            {savedRules.map((rule) => (
              <div
                key={rule.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedRuleId === rule.id
                    ? "border-bi-navy bg-blue-50"
                    : "border-gray-100 hover:border-gray-200"
                }`}
                onClick={() => loadRule(rule)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{rule.name}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{rule.description || "—"}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteRule(rule.id); }}
                    className="text-gray-400 hover:text-red-500 ml-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant={
                      rule.severity === "CRITICAL" ? "danger" :
                      rule.severity === "HIGH" ? "warning" :
                      rule.severity === "LOW" ? "success" : "info"
                    }
                    className="text-[10px]"
                  >
                    {rule.severity}
                  </Badge>
                  <Badge variant={rule.isActive ? "success" : "default"} className="text-[10px]">
                    {rule.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <span className="text-[10px] text-gray-400 ml-auto">
                    {rule.triggerCount || 0} triggers
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Canvas */}
        <div className={`${showSavedList ? "lg:col-span-2" : "lg:col-span-3"} bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden`} style={{ height: 600 }}>
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-bi-navy" />
              <div>
                <input
                  type="text"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="font-semibold text-gray-900 bg-transparent border-none outline-none focus:ring-0 p-0 text-base"
                  placeholder="Rule name..."
                />
              </div>
              <Badge variant={ruleIsActive ? "success" : "default"} className="text-xs">
                {ruleIsActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
              <Button variant="outline" size="sm" onClick={handleTest}>
                <Play className="w-4 h-4 mr-1" />
                Test
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-1" />
                {selectedRuleId ? "Update" : "Save Rule"}
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

        {/* Properties / Palette Sidebar */}
        <div className={`${showSavedList ? "lg:col-span-1" : "lg:col-span-1"} space-y-4`}>
          {/* Node Palette */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Node Palette
            </h3>
            <div className="space-y-2">
              <div
                className="p-3 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => addNode("trigger")}
              >
                <p className="text-xs font-medium text-blue-800">+ Trigger</p>
                <p className="text-xs text-blue-600">Transaction event</p>
              </div>
              <div
                className="p-3 bg-orange-50 rounded-lg border border-orange-200 cursor-pointer hover:bg-orange-100 transition-colors"
                onClick={() => addNode("condition")}
              >
                <p className="text-xs font-medium text-orange-800">+ Condition</p>
                <p className="text-xs text-orange-600">IF logic check</p>
              </div>
              <div
                className="p-3 bg-green-50 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
                onClick={() => addNode("action")}
              >
                <p className="text-xs font-medium text-green-800">+ Action</p>
                <p className="text-xs text-green-600">THEN execute</p>
              </div>
            </div>
          </div>

          {/* Properties Panel */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Properties
            </h3>
            {selectedNode ? (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">Node: <span className="font-mono text-gray-700">{selectedNode.id}</span></p>
                <p className="text-xs text-gray-500">Type: <Badge variant="info" className="text-[10px]">{selectedNode.data?.type as string || "default"}</Badge></p>

                {selectedNode.data?.type === "trigger" && (
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Trigger Type</label>
                    <select
                      className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-bi-navy"
                      value={(selectedNode.data?.definition as TriggerConfig)?.type || ""}
                      onChange={(e) => {
                        const opt = TRIGGER_OPTIONS.find((t) => t.value === e.target.value);
                        if (opt) setCurrentDefinition((prev) => ({ ...prev, trigger: { type: opt.value, label: opt.label } }));
                      }}
                    >
                      {TRIGGER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedNode.data?.type === "condition" && (
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Condition Field</label>
                      <select
                        className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-bi-navy"
                        value={(selectedNode.data?.definition as ConditionConfig)?.field || ""}
                        onChange={(e) => {
                          const fieldInfo = conditionFieldOptions.find((f) => f.value === e.target.value);
                          if (fieldInfo) {
                            const cond = selectedNode.data?.definition as ConditionConfig;
                            updateCondition(cond.id, {
                              field: fieldInfo.value,
                              source: fieldInfo.source,
                              operator: fieldInfo.operators[0],
                            });
                          }
                        }}
                      >
                        {conditionFieldOptions.map((f) => (
                          <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Operator</label>
                      <select
                        className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-bi-navy"
                        value={(selectedNode.data?.definition as ConditionConfig)?.operator || "GT"}
                        onChange={(e) => {
                          const cond = selectedNode.data?.definition as ConditionConfig;
                          updateCondition(cond.id, { operator: e.target.value as any });
                        }}
                      >
                        {(selectedNode.data?.definition as ConditionConfig) && (
                          (() => {
                            const cond = selectedNode.data?.definition as ConditionConfig;
                            const fieldInfo = conditionFieldOptions.find((f) => f.value === cond.field);
                            const ops = fieldInfo?.operators || ["GT", "GTE", "LT", "LTE", "EQ"];
                            return ops.map((op) => (
                              <option key={op} value={op}>{OPERATOR_LABELS[op]} ({op})</option>
                            ));
                          })()
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Value</label>
                      <input
                        type="text"
                        className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-bi-navy"
                        value={(selectedNode.data?.definition as ConditionConfig)?.value || ""}
                        onChange={(e) => {
                          const cond = selectedNode.data?.definition as ConditionConfig;
                          updateCondition(cond.id, { value: e.target.value });
                        }}
                        placeholder="Enter value..."
                      />
                    </div>
                    <button
                      onClick={() => {
                        const cond = selectedNode.data?.definition as ConditionConfig;
                        if (cond) removeCondition(cond.id);
                      }}
                      className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Remove condition
                    </button>
                  </div>
                )}

                {selectedNode.data?.type === "action" && (
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Action Type</label>
                    <select
                      className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-bi-navy"
                      value={(selectedNode.data?.definition as ActionConfig)?.type || ""}
                      onChange={(e) => {
                        const opt = ACTION_OPTIONS.find((a) => a.value === e.target.value);
                        if (opt) setCurrentDefinition((prev) => ({ ...prev, action: { type: opt.value, label: opt.label } }));
                      }}
                    >
                      {ACTION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Click a node on the canvas to edit properties</p>
            )}
          </div>

          {/* Rule Settings */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Rule Settings</h3>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Description</label>
                <input
                  type="text"
                  value={ruleDesc}
                  onChange={(e) => setRuleDesc(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-bi-navy"
                  placeholder="Rule description..."
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Severity</label>
                <select
                  value={ruleSeverity}
                  onChange={(e) => setRuleSeverity(e.target.value as Severity)}
                  className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-bi-navy"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ruleIsActive}
                  onChange={(e) => setRuleIsActive(e.target.checked)}
                  className="rounded"
                />
                Active
              </label>
            </div>
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`rounded-xl border shadow-sm p-4 ${
              testResult.matched ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {testResult.matched ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-semibold text-red-700">Rule Matched</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-semibold text-green-700">No Match</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-600">{testResult.explanation}</p>
            </div>
          )}

          {/* Model Performance */}
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
