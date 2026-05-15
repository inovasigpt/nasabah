"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, GitBranch, Table2, AlertTriangle, ChevronDown, ChevronRight, Maximize2, Minimize2, Info } from "lucide-react";
import CytoscapeComponent from "react-cytoscapejs";

// ============================================================================
// MOCK DATA - Hierarchical Money Trail
// ============================================================================

interface TrailNode {
  id: string;
  label: string;
  name: string;
  accountNumber: string;
  risk: number;
  status: "ACTIVE" | "FLAGGED" | "RESTRICTED" | "FROZEN";
  explanation: string;
  balance: number;
  totalInflow: number;
  totalOutflow: number;
  depth: number;
  children: string[]; // edge IDs that connect to children
  parentEdges: string[]; // edge IDs that connect from parents
}

interface TrailEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  amount: number;
  date: string;
  channel: string;
  isAnomaly: boolean;
}

const nodesData: Record<string, TrailNode> = {
  // Level 0 - Root/Source
  "root1": {
    id: "root1",
    label: "Budi Santoso\n1000000001",
    name: "Budi Santoso",
    accountNumber: "1000000001",
    risk: 15,
    status: "ACTIVE",
    explanation: "Low risk: Consistent transaction behavior for 3+ years. Regular login from Jakarta IP. No anomaly patterns detected.",
    balance: 25000000,
    totalInflow: 125000000,
    totalOutflow: 100000000,
    depth: 0,
    children: ["e1", "e6"],
    parentEdges: [],
  },
  "root2": {
    id: "root2",
    label: "Ani Wijaya\n1000000002",
    name: "Ani Wijaya",
    accountNumber: "1000000002",
    risk: 25,
    status: "ACTIVE",
    explanation: "Low-Medium risk: Occasional late-night transactions. Device fingerprint consistent. No fraud complaints.",
    balance: 45000000,
    totalInflow: 89000000,
    totalOutflow: 44000000,
    depth: 0,
    children: ["e3"],
    parentEdges: [],
  },
  "root3": {
    id: "root3",
    label: "Maya Sari\n1000000006",
    name: "Maya Sari",
    accountNumber: "1000000006",
    risk: 10,
    status: "ACTIVE",
    explanation: "Very low risk: High-net-worth customer with stable transaction profile. All logins from verified devices.",
    balance: 67000000,
    totalInflow: 210000000,
    totalOutflow: 143000000,
    depth: 0,
    children: ["e4"],
    parentEdges: [],
  },
  // Level 1 - Intermediate
  "l1_1": {
    id: "l1_1",
    label: "Dedi Pratama\n1000000003",
    name: "Dedi Pratama",
    accountNumber: "1000000003",
    risk: 55,
    status: "FLAGGED",
    explanation: "Medium risk: Received multiple large transfers from unrelated accounts within 24h. IP location switched from Surabaya to Batam rapidly.",
    balance: 12000000,
    totalInflow: 8500000,
    totalOutflow: 5500000,
    depth: 1,
    children: ["e2", "e7"],
    parentEdges: ["e1", "e3"],
  },
  "l1_2": {
    id: "l1_2",
    label: "Ahmad Fauzi\n1000000009",
    name: "Ahmad Fauzi",
    accountNumber: "1000000009",
    risk: 65,
    status: "FLAGGED",
    explanation: "Medium-High risk: Sudden increase in transaction frequency. 8 transactions in 2 hours vs historical average of 1 per day. Device changed twice.",
    balance: 9200000,
    totalInflow: 15000000,
    totalOutflow: 22000000,
    depth: 1,
    children: ["e5", "e8"],
    parentEdges: ["e4"],
  },
  "l1_3": {
    id: "l1_3",
    label: "Siti Aminah\n1000000008",
    name: "Siti Aminah",
    accountNumber: "1000000008",
    risk: 78,
    status: "RESTRICTED",
    explanation: "High risk: Account accessed via VPN from Philippines. Previous login was from Medan 3 hours prior. Impossible travel pattern detected.",
    balance: 8000000,
    totalInflow: 32000000,
    totalOutflow: 24000000,
    depth: 1,
    children: ["e9", "e10"],
    parentEdges: ["e6"],
  },
  // Level 2 - Mule/Collectors
  "l2_1": {
    id: "l2_1",
    label: "Rudi Hartono\n1000000005",
    name: "Rudi Hartono",
    accountNumber: "1000000005",
    risk: 95,
    status: "FROZEN",
    explanation: "CRITICAL: Identified as suspected mule account. Received funds from 5 different accounts in 6 hours. All funds immediately withdrawn via ATM across 3 cities. Linked to known fraud ring ID #FR-2026-0442.",
    balance: 5000000,
    totalInflow: 45000000,
    totalOutflow: 40000000,
    depth: 2,
    children: ["e11", "e12"],
    parentEdges: ["e2", "e5"],
  },
  "l2_2": {
    id: "l2_2",
    label: "Joko Widodo\n1000000007",
    name: "Joko Widodo",
    accountNumber: "1000000007",
    risk: 42,
    status: "ACTIVE",
    explanation: "Medium risk: Receives regular transfers from Dedi Pratama. Pattern suggests salary or business payment. Under observation.",
    balance: 34000000,
    totalInflow: 56000000,
    totalOutflow: 22000000,
    depth: 2,
    children: ["e13"],
    parentEdges: ["e7"],
  },
  "l2_3": {
    id: "l2_3",
    label: "Dewi Kusuma\n1000000010",
    name: "Dewi Kusuma",
    accountNumber: "1000000010",
    risk: 30,
    status: "ACTIVE",
    explanation: "Low-Medium risk: Regular small transfers from Ahmad Fauzi. Consistent monthly pattern. No suspicious activity.",
    balance: 55000000,
    totalInflow: 78000000,
    totalOutflow: 23000000,
    depth: 2,
    children: ["e14"],
    parentEdges: ["e8"],
  },
  "l2_4": {
    id: "l2_4",
    label: "Bayu Anggara\n1000000011",
    name: "Bayu Anggara",
    accountNumber: "1000000011",
    risk: 88,
    status: "RESTRICTED",
    explanation: "High risk: New account (12 days old). Received Rp 28M from Siti Aminah. All funds transferred to offshore exchange within 2 hours. Strong indicator of layering activity.",
    balance: 1500000,
    totalInflow: 28000000,
    totalOutflow: 26500000,
    depth: 2,
    children: ["e15"],
    parentEdges: ["e9"],
  },
  "l2_5": {
    id: "l2_5",
    label: "Citra Lestari\n1000000012",
    name: "Citra Lestari",
    accountNumber: "1000000012",
    risk: 72,
    status: "RESTRICTED",
    explanation: "High risk: Circular transaction detected. Sent Rp 15M to Siti Aminah, who sent it back via 3 intermediate accounts. Classic money laundering structure.",
    balance: 4200000,
    totalInflow: 19000000,
    totalOutflow: 14800000,
    depth: 2,
    children: [],
    parentEdges: ["e10"],
  },
  // Level 3 - Terminal/Exit nodes
  "l3_1": {
    id: "l3_1",
    label: "Andi Wijaya\n1000000013",
    name: "Andi Wijaya",
    accountNumber: "1000000013",
    risk: 92,
    status: "FROZEN",
    explanation: "CRITICAL: Terminal account in fraud chain. Receives aggregated funds from Rudi Hartono and Bayu Anggara. 98% of funds cashed out via ATM within 24h. Device fingerprint matches known fraud syndicate.",
    balance: 800000,
    totalInflow: 62000000,
    totalOutflow: 61200000,
    depth: 3,
    children: [],
    parentEdges: ["e11", "e15"],
  },
  "l3_2": {
    id: "l3_2",
    label: "Rina Susanti\n1000000014",
    name: "Rina Susanti",
    accountNumber: "1000000014",
    risk: 85,
    status: "RESTRICTED",
    explanation: "High risk: Dormant account for 8 months, suddenly active with Rp 20M transfer. Funds immediately used for cryptocurrency purchase via P2P platform.",
    balance: 2500000,
    totalInflow: 20000000,
    totalOutflow: 17500000,
    depth: 3,
    children: [],
    parentEdges: ["e12"],
  },
  "l3_3": {
    id: "l3_3",
    label: "PT. Sejahtera\n1000000015",
    name: "PT. Sejahtera",
    accountNumber: "1000000015",
    risk: 35,
    status: "ACTIVE",
    explanation: "Low-Medium risk: Corporate account receiving payment from Joko Widodo. Business registration verified. Transaction amount aligns with invoice history.",
    balance: 120000000,
    totalInflow: 450000000,
    totalOutflow: 330000000,
    depth: 3,
    children: [],
    parentEdges: ["e13"],
  },
  "l3_4": {
    id: "l3_4",
    label: "Eko Prasetyo\n1000000016",
    name: "Eko Prasetyo",
    accountNumber: "1000000016",
    risk: 48,
    status: "FLAGGED",
    explanation: "Medium risk: Received Rp 8M from Dewi Kusuma. Pattern suggests personal loan repayment. Account shows mixed personal/business usage.",
    balance: 18000000,
    totalInflow: 35000000,
    totalOutflow: 17000000,
    depth: 3,
    children: [],
    parentEdges: ["e14"],
  },
};

const edgesData: Record<string, TrailEdge> = {
  // Level 0 -> 1
  "e1": { id: "e1", source: "root1", target: "l1_1", label: "Rp 2.5M", amount: 2500000, date: "2026-05-14", channel: "Mobile Banking", isAnomaly: true },
  "e3": { id: "e3", source: "root2", target: "l1_1", label: "Rp 3.0M", amount: 3000000, date: "2026-05-14", channel: "Internet Banking", isAnomaly: true },
  "e4": { id: "e4", source: "root3", target: "l1_2", label: "Rp 900K", amount: 900000, date: "2026-05-12", channel: "Mobile Banking", isAnomaly: false },
  "e6": { id: "e6", source: "root1", target: "l1_3", label: "Rp 5.0M", amount: 5000000, date: "2026-05-11", channel: "Branch", isAnomaly: true },
  // Level 1 -> 2
  "e2": { id: "e2", source: "l1_1", target: "l2_1", label: "Rp 1.8M", amount: 1800000, date: "2026-05-13", channel: "ATM", isAnomaly: true },
  "e7": { id: "e7", source: "l1_1", target: "l2_2", label: "Rp 2.2M", amount: 2200000, date: "2026-05-13", channel: "Mobile Banking", isAnomaly: false },
  "e5": { id: "e5", source: "l1_2", target: "l2_1", label: "Rp 1.2M", amount: 1200000, date: "2026-05-12", channel: "ATM", isAnomaly: true },
  "e8": { id: "e8", source: "l1_2", target: "l2_3", label: "Rp 800K", amount: 800000, date: "2026-05-11", channel: "Internet Banking", isAnomaly: false },
  "e9": { id: "e9", source: "l1_3", target: "l2_4", label: "Rp 28M", amount: 28000000, date: "2026-05-10", channel: "Mobile Banking", isAnomaly: true },
  "e10": { id: "e10", source: "l1_3", target: "l2_5", label: "Rp 15M", amount: 15000000, date: "2026-05-09", channel: "Internet Banking", isAnomaly: true },
  // Level 2 -> 3
  "e11": { id: "e11", source: "l2_1", target: "l3_1", label: "Rp 4.5M", amount: 4500000, date: "2026-05-13", channel: "ATM", isAnomaly: true },
  "e12": { id: "e12", source: "l2_1", target: "l3_2", label: "Rp 20M", amount: 20000000, date: "2026-05-12", channel: "Branch", isAnomaly: true },
  "e13": { id: "e13", source: "l2_2", target: "l3_3", label: "Rp 5.6M", amount: 5600000, date: "2026-05-10", channel: "Internet Banking", isAnomaly: false },
  "e14": { id: "e14", source: "l2_3", target: "l3_4", label: "Rp 8M", amount: 8000000, date: "2026-05-08", channel: "Mobile Banking", isAnomaly: false },
  "e15": { id: "e15", source: "l2_4", target: "l3_1", label: "Rp 26.5M", amount: 26500000, date: "2026-05-09", channel: "ATM", isAnomaly: true },
};

// Root nodes (starting points)
const ROOT_NODE_IDS = ["root1", "root2", "root3"];

// ============================================================================
// COMPONENTS
// ============================================================================

function getNodeColor(risk: number, status: string) {
  if (status === "FROZEN") return "#7f1d1d"; // dark red
  if (risk >= 90) return "#dc2626"; // red-600
  if (risk >= 70) return "#ef4444"; // red-500
  if (risk >= 50) return "#f97316"; // orange-500
  if (risk >= 30) return "#eab308"; // yellow-500
  return "#003366"; // bi-navy
}

function getNodeBorderColor(risk: number, status: string) {
  if (status === "FROZEN") return "#450a0a";
  if (risk >= 70) return "#991b1b";
  if (risk >= 50) return "#c2410c";
  if (risk >= 30) return "#a16207";
  return "#FFCC00";
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "ACTIVE": return "success";
    case "FLAGGED": return "warning";
    case "RESTRICTED": return "danger";
    case "FROZEN": return "danger";
    default: return "default";
  }
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  nodeId: string | null;
}

function NodeTooltip({ state, node }: { state: TooltipState; node: TrailNode | null }) {
  if (!state.visible || !node) return null;

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{ left: state.x + 15, top: state.y + 15 }}
    >
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-80 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-bold text-gray-900 text-sm">{node.name}</h4>
            <p className="text-xs text-gray-500 font-mono">{node.accountNumber}</p>
          </div>
          <Badge variant={getStatusBadgeVariant(node.status)} className="text-xs">
            {node.status}
          </Badge>
        </div>

        {/* Risk Score */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Risk Score</span>
            <span className={`text-sm font-bold ${node.risk >= 70 ? "text-red-600" : node.risk >= 50 ? "text-orange-600" : "text-green-600"}`}>
              {node.risk}/100
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${node.risk >= 70 ? "bg-red-500" : node.risk >= 50 ? "bg-orange-500" : "bg-green-500"}`}
              style={{ width: `${node.risk}%` }}
            />
          </div>
        </div>

        {/* Explanation (XAI) */}
        <div className="mb-3 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center gap-1.5 mb-1">
            <Info className="w-3 h-3 text-blue-600" />
            <span className="text-xs font-semibold text-blue-800">AI Explanation</span>
          </div>
          <p className="text-xs text-blue-700 leading-relaxed">{node.explanation}</p>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-1.5 bg-gray-50 rounded">
            <p className="text-[10px] text-gray-500">Balance</p>
            <p className="text-xs font-semibold text-gray-900">Rp {(node.balance / 1000000).toFixed(1)}M</p>
          </div>
          <div className="p-1.5 bg-green-50 rounded">
            <p className="text-[10px] text-green-600">Inflow</p>
            <p className="text-xs font-semibold text-green-700">Rp {(node.totalInflow / 1000000).toFixed(1)}M</p>
          </div>
          <div className="p-1.5 bg-red-50 rounded">
            <p className="text-[10px] text-red-600">Outflow</p>
            <p className="text-xs font-semibold text-red-700">Rp {(node.totalOutflow / 1000000).toFixed(1)}M</p>
          </div>
        </div>

        {/* Depth indicator */}
        <div className="mt-2 flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${node.depth === 0 ? "bg-blue-500" : node.depth === 1 ? "bg-orange-500" : node.depth === 2 ? "bg-red-500" : "bg-red-700"}`} />
          <span className="text-[10px] text-gray-400">
            Hop {node.depth} {node.depth === 0 ? "(Source)" : node.depth === 3 ? "(Terminal)" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function InvestigationPage() {
  const [activeTab, setActiveTab] = useState<"ledger" | "money-trail">("money-trail");
  const [search, setSearch] = useState("");
  const [filterAnomaly, setFilterAnomaly] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(ROOT_NODE_IDS));
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, nodeId: null });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const cyRef = useRef<any>(null);

  // Build cytoscape elements based on expanded nodes
  const cytoscapeElements = useCallback(() => {
    const elements: any[] = [];
    const visibleNodeIds = new Set<string>();

    // Always include root nodes
    ROOT_NODE_IDS.forEach((id) => visibleNodeIds.add(id));

    // Include expanded nodes and their children
    expandedNodes.forEach((nodeId) => {
      const node = nodesData[nodeId];
      if (!node) return;

      node.children.forEach((edgeId) => {
        const edge = edgesData[edgeId];
        if (!edge) return;
        visibleNodeIds.add(edge.target);
      });
    });

    // Add visible nodes
    visibleNodeIds.forEach((nodeId) => {
      const node = nodesData[nodeId];
      if (!node) return;
      const isExpanded = expandedNodes.has(nodeId);
      const hasChildren = node.children.length > 0;
      const isSelected = selectedNode === nodeId;

      elements.push({
        data: {
          id: node.id,
          label: node.label,
          risk: node.risk,
          status: node.status,
          explanation: node.explanation,
          balance: node.balance,
          isExpandable: hasChildren,
          isExpanded: isExpanded,
        },
        style: {
          "background-color": getNodeColor(node.risk, node.status),
          "border-color": isSelected ? "#FFCC00" : getNodeBorderColor(node.risk, node.status),
          "border-width": isSelected ? 4 : 2,
          shape: hasChildren ? (isExpanded ? "round-rectangle" : "ellipse") : "ellipse",
          width: node.depth === 0 ? 90 : node.depth === 3 ? 70 : 80,
          height: node.depth === 0 ? 90 : node.depth === 3 ? 70 : 80,
          "font-size": node.depth === 0 ? 11 : 9,
          "text-max-width": node.depth === 0 ? 80 : 70,
        },
      });
    });

    // Add visible edges
    expandedNodes.forEach((nodeId) => {
      const node = nodesData[nodeId];
      if (!node) return;

      node.children.forEach((edgeId) => {
        const edge = edgesData[edgeId];
        if (!edge || !visibleNodeIds.has(edge.target)) return;

        elements.push({
          data: {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            label: edge.label,
            amount: edge.amount,
            isAnomaly: edge.isAnomaly,
          },
          style: {
            width: edge.isAnomaly ? 3 : 1.5,
            "line-color": edge.isAnomaly ? "#dc2626" : "#94a3b8",
            "target-arrow-color": edge.isAnomaly ? "#dc2626" : "#94a3b8",
            "line-style": edge.isAnomaly ? "dashed" : "solid",
          },
        });
      });
    });

    return elements;
  }, [expandedNodes, selectedNode]);

  const handleNodeClick = useCallback((nodeId: string) => {
    const node = nodesData[nodeId];
    if (!node || node.children.length === 0) {
      setSelectedNode(nodeId);
      return;
    }

    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        // Collapse: remove this node and recursively collapse its descendants
        const toCollapse = new Set<string>();
        const queue = [nodeId];
        while (queue.length > 0) {
          const current = queue.shift()!;
          if (toCollapse.has(current)) continue;
          toCollapse.add(current);
          const currentNode = nodesData[current];
          if (currentNode) {
            currentNode.children.forEach((edgeId) => {
              const edge = edgesData[edgeId];
              if (edge && next.has(edge.target)) {
                queue.push(edge.target);
              }
            });
          }
        }
        toCollapse.forEach((id) => next.delete(id));
      } else {
        // Expand
        next.add(nodeId);
      }
      return next;
    });

    setSelectedNode(nodeId);
  }, []);

  const expandAll = useCallback(() => {
    setExpandedNodes(new Set(Object.keys(nodesData)));
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set(ROOT_NODE_IDS));
  }, []);

  // Ledger data
  const mockTransactions = [
    { id: 1, sender: "Budi Santoso", recipient: "Dedi Pratama", amount: 2500000, date: "2026-05-14", channel: "Mobile Banking", ip: "192.168.1.45", anomaly: true },
    { id: 2, sender: "Ani Wijaya", recipient: "Dedi Pratama", amount: 3000000, date: "2026-05-14", channel: "Internet Banking", ip: "192.168.2.101", anomaly: true },
    { id: 3, sender: "Dedi Pratama", recipient: "Rudi Hartono", amount: 1800000, date: "2026-05-13", channel: "ATM", ip: "10.0.0.15", anomaly: true },
    { id: 4, sender: "Maya Sari", recipient: "Ahmad Fauzi", amount: 900000, date: "2026-05-12", channel: "Mobile Banking", ip: "192.168.5.22", anomaly: false },
    { id: 5, sender: "Ahmad Fauzi", recipient: "Rudi Hartono", amount: 1200000, date: "2026-05-12", channel: "ATM", ip: "10.0.0.88", anomaly: true },
    { id: 6, sender: "Budi Santoso", recipient: "Siti Aminah", amount: 5000000, date: "2026-05-11", channel: "Branch", ip: "192.168.1.45", anomaly: true },
    { id: 7, sender: "Dedi Pratama", recipient: "Joko Widodo", amount: 2200000, date: "2026-05-13", channel: "Mobile Banking", ip: "192.168.3.12", anomaly: false },
    { id: 8, sender: "Ahmad Fauzi", recipient: "Dewi Kusuma", amount: 800000, date: "2026-05-11", channel: "Internet Banking", ip: "192.168.5.22", anomaly: false },
    { id: 9, sender: "Siti Aminah", recipient: "Bayu Anggara", amount: 28000000, date: "2026-05-10", channel: "Mobile Banking", ip: "203.89.12.44", anomaly: true },
    { id: 10, sender: "Siti Aminah", recipient: "Citra Lestari", amount: 15000000, date: "2026-05-09", channel: "Internet Banking", ip: "203.89.12.44", anomaly: true },
    { id: 11, sender: "Rudi Hartono", recipient: "Andi Wijaya", amount: 4500000, date: "2026-05-13", channel: "ATM", ip: "10.0.0.15", anomaly: true },
    { id: 12, sender: "Rudi Hartono", recipient: "Rina Susanti", amount: 20000000, date: "2026-05-12", channel: "Branch", ip: "10.0.0.88", anomaly: true },
    { id: 13, sender: "Joko Widodo", recipient: "PT. Sejahtera", amount: 5600000, date: "2026-05-10", channel: "Internet Banking", ip: "192.168.3.12", anomaly: false },
    { id: 14, sender: "Dewi Kusuma", recipient: "Eko Prasetyo", amount: 8000000, date: "2026-05-08", channel: "Mobile Banking", ip: "192.168.9.77", anomaly: false },
    { id: 15, sender: "Bayu Anggara", recipient: "Andi Wijaya", amount: 26500000, date: "2026-05-09", channel: "ATM", ip: "203.89.12.44", anomaly: true },
  ];

  const filteredTransactions = mockTransactions.filter((tx) => {
    const matchesSearch =
      tx.sender.toLowerCase().includes(search.toLowerCase()) ||
      tx.recipient.toLowerCase().includes(search.toLowerCase());
    const matchesAnomaly = filterAnomaly ? tx.anomaly : true;
    return matchesSearch && matchesAnomaly;
  });

  // Get selected node data for side panel
  const selectedNodeData = selectedNode ? nodesData[selectedNode] : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fraud Investigation</h1>
        <p className="text-gray-500 mt-1">Ledger analysis and interactive money trail visualization</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white rounded-xl border border-gray-100 shadow-sm p-1 w-fit">
        <button
          onClick={() => setActiveTab("ledger")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "ledger"
              ? "bg-bi-navy text-white"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Table2 className="w-4 h-4" />
          Ledger Analysis
        </button>
        <button
          onClick={() => setActiveTab("money-trail")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "money-trail"
              ? "bg-bi-navy text-white"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <GitBranch className="w-4 h-4" />
          Money Trail
        </button>
      </div>

      {activeTab === "ledger" ? (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search sender or recipient..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterAnomaly}
                  onChange={(e) => setFilterAnomaly(e.target.checked)}
                  className="rounded border-gray-300 text-bi-navy focus:ring-bi-navy"
                />
                Show anomalies only
              </label>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Sender</th>
                    <th className="px-6 py-4 font-semibold">Recipient</th>
                    <th className="px-6 py-4 font-semibold">Amount</th>
                    <th className="px-6 py-4 font-semibold">Channel</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-700">{tx.date}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{tx.sender}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{tx.recipient}</td>
                      <td className="px-6 py-4 text-gray-700">
                        Rp {tx.amount.toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4 text-gray-700">{tx.channel}</td>
                      <td className="px-6 py-4">
                        {tx.anomaly ? (
                          <Badge variant="danger">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Anomaly
                          </Badge>
                        ) : (
                          <Badge variant="success">Normal</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Graph Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Controls */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Money Trail Visualization</h2>
                  <p className="text-sm text-gray-500">
                    Click nodes to expand/collapse. Hover for AI explainability.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={expandAll}>
                    <Maximize2 className="w-3.5 h-3.5 mr-1.5" />
                    Expand All
                  </Button>
                  <Button variant="outline" size="sm" onClick={collapseAll}>
                    <Minimize2 className="w-3.5 h-3.5 mr-1.5" />
                    Collapse All
                  </Button>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#003366]" />
                  <span className="text-gray-600">Low Risk (0-29)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#eab308]" />
                  <span className="text-gray-600">Medium (30-49)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#f97316]" />
                  <span className="text-gray-600">High (50-69)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                  <span className="text-gray-600">Critical (70-89)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#7f1d1d]" />
                  <span className="text-gray-600">Frozen (90+)</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <div className="w-6 h-0.5 bg-red-500 border-dashed border-t border-red-500" style={{ background: "repeating-linear-gradient(90deg, #dc2626, #dc2626 4px, transparent 4px, transparent 8px)" }} />
                  <span className="text-gray-600">Anomaly</span>
                </div>
              </div>
            </div>

            {/* Graph */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden" style={{ height: 600 }}>
              <CytoscapeComponent
                elements={cytoscapeElements()}
                style={{ width: "100%", height: "100%" }}
                stylesheet={[
                  {
                    selector: "node",
                    style: {
                      color: "#fff",
                      "text-valign": "center",
                      "text-halign": "center",
                      "font-size": "10px",
                      "text-wrap": "wrap",
                      "text-max-width": 70,
                      label: "data(label)",
                      "border-width": 2,
                      "border-color": "#FFCC00",
                      "transition-property": "background-color, border-color, border-width",
                      "transition-duration": "0.3s",
                    },
                  },
                  {
                    selector: "node[isExpandable = 'true']",
                    style: {
                      "border-style": "double",
                      "border-width": 4,
                    },
                  },
                  {
                    selector: "node[isExpanded = 'true']",
                    style: {
                      "border-style": "solid",
                    },
                  },
                  {
                    selector: "edge",
                    style: {
                      "target-arrow-shape": "triangle",
                      "curve-style": "bezier",
                      label: "data(label)",
                      "font-size": "9px",
                      color: "#64748b",
                      "text-background-color": "#fff",
                      "text-background-opacity": 1,
                      "text-background-padding": "2px",
                      "text-background-shape": "roundrectangle",
                    },
                  },
                ]}
                layout={{ name: "breadthfirst", directed: true, padding: 30, spacingFactor: 1.3 }}
                cy={(cy: any) => {
                  cyRef.current = cy;

                  cy.on("mouseover", "node", (evt: any) => {
                    const node = evt.target;
                    const nodeId = node.id();
                    const renderPos = evt.originalEvent;
                    setTooltip({
                      visible: true,
                      x: renderPos.clientX,
                      y: renderPos.clientY,
                      nodeId,
                    });
                  });

                  cy.on("mousemove", "node", (evt: any) => {
                    const renderPos = evt.originalEvent;
                    setTooltip((prev) => ({
                      ...prev,
                      x: renderPos.clientX,
                      y: renderPos.clientY,
                    }));
                  });

                  cy.on("mouseout", "node", () => {
                    setTooltip({ visible: false, x: 0, y: 0, nodeId: null });
                  });

                  cy.on("tap", "node", (evt: any) => {
                    const nodeId = evt.target.id();
                    handleNodeClick(nodeId);
                  });
                }}
              />

              {/* Tooltip overlay */}
              <NodeTooltip
                state={tooltip}
                node={tooltip.nodeId ? nodesData[tooltip.nodeId] : null}
              />
            </div>

            <p className="text-xs text-gray-400">
              * Double-border nodes can be expanded. Dashed red edges indicate anomaly transactions.
            </p>
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            {selectedNodeData ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sticky top-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{selectedNodeData.name}</h3>
                    <p className="text-xs text-gray-500 font-mono">{selectedNodeData.accountNumber}</p>
                  </div>
                  <Badge variant={getStatusBadgeVariant(selectedNodeData.status)}>
                    {selectedNodeData.status}
                  </Badge>
                </div>

                {/* Risk */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Risk Score</span>
                    <span className={`font-bold ${selectedNodeData.risk >= 70 ? "text-red-600" : "text-gray-900"}`}>
                      {selectedNodeData.risk}/100
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${selectedNodeData.risk >= 70 ? "bg-red-500" : selectedNodeData.risk >= 50 ? "bg-orange-500" : "bg-green-500"}`}
                      style={{ width: `${selectedNodeData.risk}%` }}
                    />
                  </div>
                </div>

                {/* XAI Explanation */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-800">AI Explainability</span>
                  </div>
                  <p className="text-xs text-blue-700 leading-relaxed">{selectedNodeData.explanation}</p>
                </div>

                {/* Financials */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Balance</span>
                    <span className="font-medium text-gray-900">Rp {selectedNodeData.balance.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Inflow</span>
                    <span className="font-medium text-green-600">Rp {selectedNodeData.totalInflow.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Outflow</span>
                    <span className="font-medium text-red-600">Rp {selectedNodeData.totalOutflow.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                {/* Expand/Collapse */}
                {selectedNodeData.children.length > 0 && (
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={() => handleNodeClick(selectedNodeData.id)}
                  >
                    {expandedNodes.has(selectedNodeData.id) ? (
                      <>
                        <ChevronDown className="w-4 h-4 mr-1.5" />
                        Collapse ({selectedNodeData.children.length} connections)
                      </>
                    ) : (
                      <>
                        <ChevronRight className="w-4 h-4 mr-1.5" />
                        Expand ({selectedNodeData.children.length} connections)
                      </>
                    )}
                  </Button>
                )}

                {/* Transactions list */}
                {selectedNodeData.children.length > 0 && expandedNodes.has(selectedNodeData.id) && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Outgoing Transactions</p>
                    <div className="space-y-2">
                      {selectedNodeData.children.map((edgeId) => {
                        const edge = edgesData[edgeId];
                        const target = nodesData[edge.target];
                        if (!edge || !target) return null;
                        return (
                          <div key={edgeId} className="p-2 bg-gray-50 rounded text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-600">To {target.name}</span>
                              <span className={`font-medium ${edge.isAnomaly ? "text-red-600" : "text-gray-900"}`}>
                                {edge.label}
                              </span>
                            </div>
                            <div className="flex justify-between mt-0.5 text-gray-400">
                              <span>{edge.date}</span>
                              <span>{edge.channel}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center sticky top-6">
                <GitBranch className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium">Select a node</p>
                <p className="text-xs text-gray-400 mt-1">
                  Click on any node in the graph to view detailed AI analysis and transaction history
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
