"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, GitBranch, Table2, AlertTriangle, ChevronDown, ChevronRight, Maximize2, Minimize2, Info } from "lucide-react";
import CytoscapeComponent from "react-cytoscapejs";

// ============================================================================
// MOCK DATA - Hierarchical Money Trail (Expanded)
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
  children: string[];
  parentEdges: string[];
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
  // === TRAIL A: Budi Santoso ===
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
    children: ["e1", "e6", "e16"],
    parentEdges: [],
  },
  "l1_1": {
    id: "l1_1",
    label: "Dedi Pratama\n1000000003",
    name: "Dedi Pratama",
    accountNumber: "1000000003",
    risk: 55,
    status: "FLAGGED",
    explanation: "Medium risk: Received multiple large transfers from unrelated accounts within 24h. IP location switched from Surabaya to Batam rapidly.",
    balance: 12000000,
    totalInflow: 85000000,
    totalOutflow: 55000000,
    depth: 1,
    children: ["e2", "e7", "e17"],
    parentEdges: ["e1", "e3"],
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
    children: ["e9", "e10", "e18"],
    parentEdges: ["e6", "e25"],
  },
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
    children: ["e11", "e12", "e19"],
    parentEdges: ["e2", "e5", "e31"],
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
    children: ["e13", "e20"],
    parentEdges: ["e7"],
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
    children: ["e15", "e21"],
    parentEdges: ["e9", "e34"],
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
    children: ["e22"],
    parentEdges: ["e10", "e32"],
  },
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
    children: ["e23"],
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
    parentEdges: ["e12", "e36"],
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
    parentEdges: ["e13", "e37"],
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
    parentEdges: ["e14", "e33"],
  },
  "l4_1": {
    id: "l4_1",
    label: "Fajar Nugroho\n1000000017",
    name: "Fajar Nugroho",
    accountNumber: "1000000017",
    risk: 96,
    status: "FROZEN",
    explanation: "CRITICAL: Syndicate leader account. Received Rp 30M from Andi Wijaya. Funds split to 4 offshore accounts within 1 hour. Linked to international fraud ring.",
    balance: 1200000,
    totalInflow: 85000000,
    totalOutflow: 83800000,
    depth: 4,
    children: [],
    parentEdges: ["e23"],
  },

  // === TRAIL B: Ani Wijaya ===
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
    children: ["e3", "e24"],
    parentEdges: [],
  },
  "b_l1_1": {
    id: "b_l1_1",
    label: "Hendra Gunawan\n1000000018",
    name: "Hendra Gunawan",
    accountNumber: "1000000018",
    risk: 62,
    status: "FLAGGED",
    explanation: "Medium-High risk: Received Rp 12M from Ani Wijaya. Account opened 3 months ago with minimal activity before this large transfer.",
    balance: 3500000,
    totalInflow: 25000000,
    totalOutflow: 21500000,
    depth: 1,
    children: ["e25", "e26"],
    parentEdges: ["e24"],
  },
  "b_l1_2": {
    id: "b_l1_2",
    label: "Nina Marlina\n1000000019",
    name: "Nina Marlina",
    accountNumber: "1000000019",
    risk: 45,
    status: "FLAGGED",
    explanation: "Medium risk: Regular recipient from Ani Wijaya. Appears to be a supplier payment pattern but amounts vary significantly.",
    balance: 22000000,
    totalInflow: 48000000,
    totalOutflow: 26000000,
    depth: 1,
    children: ["e27", "e28"],
    parentEdges: ["e3"],
  },
  "b_l2_1": {
    id: "b_l2_1",
    label: "Doni Saputra\n1000000020",
    name: "Doni Saputra",
    accountNumber: "1000000020",
    risk: 81,
    status: "RESTRICTED",
    explanation: "High risk: Mule account pattern. Received funds from Hendra Gunawan and immediately forwarded to Siti Aminah. 4 transactions in 30 minutes.",
    balance: 900000,
    totalInflow: 18000000,
    totalOutflow: 17100000,
    depth: 2,
    children: ["e29", "e30"],
    parentEdges: ["e26"],
  },
  "b_l2_2": {
    id: "b_l2_2",
    label: "Lina Kusuma\n1000000021",
    name: "Lina Kusuma",
    accountNumber: "1000000021",
    risk: 38,
    status: "ACTIVE",
    explanation: "Low-Medium risk: Small business owner receiving payments from Nina Marlina. Transaction history shows regular business hours activity.",
    balance: 31000000,
    totalInflow: 67000000,
    totalOutflow: 36000000,
    depth: 2,
    children: ["e31"],
    parentEdges: ["e27"],
  },
  "b_l3_1": {
    id: "b_l3_1",
    label: "PT. Delta Nusantara\n1000000022",
    name: "PT. Delta Nusantara",
    accountNumber: "1000000022",
    risk: 58,
    status: "FLAGGED",
    explanation: "Medium risk: Corporate shell company. Received Rp 15M from Doni Saputra. No verifiable business operations found in tax records.",
    balance: 4500000,
    totalInflow: 35000000,
    totalOutflow: 30500000,
    depth: 3,
    children: ["e32"],
    parentEdges: ["e29"],
  },
  "b_l3_2": {
    id: "b_l3_2",
    label: "Wawan Setiawan\n1000000023",
    name: "Wawan Setiawan",
    accountNumber: "1000000023",
    risk: 74,
    status: "RESTRICTED",
    explanation: "High risk: Received Rp 8M from Doni Saputra. All funds used for prepaid card purchases. Linked to gift card fraud scheme.",
    balance: 500000,
    totalInflow: 12000000,
    totalOutflow: 11500000,
    depth: 3,
    children: [],
    parentEdges: ["e30"],
  },
  "b_l4_1": {
    id: "b_l4_1",
    label: "Yusuf Ibrahim\n1000000024",
    name: "Yusuf Ibrahim",
    accountNumber: "1000000024",
    risk: 91,
    status: "FROZEN",
    explanation: "CRITICAL: Cross-network aggregator. Receives from PT. Delta Nusantara and Citra Lestari. Terminal node for multiple fraud schemes.",
    balance: 800000,
    totalInflow: 55000000,
    totalOutflow: 54200000,
    depth: 4,
    children: [],
    parentEdges: ["e32"],
  },

  // === TRAIL C: Maya Sari ===
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
    children: ["e4", "e33", "e34"],
    parentEdges: [],
  },
  "c_l1_1": {
    id: "c_l1_1",
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
    children: ["e5", "e8", "e35"],
    parentEdges: ["e4"],
  },
  "c_l2_1": {
    id: "c_l2_1",
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
    children: ["e14", "e36"],
    parentEdges: ["e8", "e35"],
  },
  "c_l3_1": {
    id: "c_l3_1",
    label: "Rizky Pratama\n1000000025",
    name: "Rizky Pratama",
    accountNumber: "1000000025",
    risk: 52,
    status: "FLAGGED",
    explanation: "Medium risk: Received Rp 5M from Dewi Kusuma. Account shows mixed personal and online trading activity. Under enhanced monitoring.",
    balance: 12500000,
    totalInflow: 28000000,
    totalOutflow: 15500000,
    depth: 3,
    children: ["e37"],
    parentEdges: ["e14"],
  },

  // === TRAIL D: Agus Salim ===
  "root4": {
    id: "root4",
    label: "Agus Salim\n1000000026",
    name: "Agus Salim",
    accountNumber: "1000000026",
    risk: 20,
    status: "ACTIVE",
    explanation: "Low risk: Retired civil servant with predictable pension deposit and withdrawal patterns. All transactions during business hours.",
    balance: 85000000,
    totalInflow: 156000000,
    totalOutflow: 71000000,
    depth: 0,
    children: ["e38", "e39"],
    parentEdges: [],
  },
  "d_l1_1": {
    id: "d_l1_1",
    label: "Sri Wahyuni\n1000000027",
    name: "Sri Wahyuni",
    accountNumber: "1000000027",
    risk: 40,
    status: "FLAGGED",
    explanation: "Medium risk: Daughter of Agus Salim. Received large inheritance transfer. Some transactions to online gaming platforms.",
    balance: 45000000,
    totalInflow: 92000000,
    totalOutflow: 47000000,
    depth: 1,
    children: ["e40", "e41"],
    parentEdges: ["e38"],
  },
  "d_l1_2": {
    id: "d_l1_2",
    label: "Bambang Wijaya\n1000000028",
    name: "Bambang Wijaya",
    accountNumber: "1000000028",
    risk: 70,
    status: "RESTRICTED",
    explanation: "High risk: Business partner of Agus Salim. Received Rp 25M investment. Funds immediately moved to cryptocurrency exchange.",
    balance: 3000000,
    totalInflow: 35000000,
    totalOutflow: 32000000,
    depth: 1,
    children: ["e42"],
    parentEdges: ["e39"],
  },
  "d_l2_1": {
    id: "d_l2_1",
    label: "Rina Oktaviani\n1000000029",
    name: "Rina Oktaviani",
    accountNumber: "1000000029",
    risk: 55,
    status: "FLAGGED",
    explanation: "Medium risk: Received Rp 8M from Sri Wahyuni. Used for property down payment. Documentation incomplete but plausible.",
    balance: 18000000,
    totalInflow: 28000000,
    totalOutflow: 10000000,
    depth: 2,
    children: [],
    parentEdges: ["e40"],
  },
  "d_l2_2": {
    id: "d_l2_2",
    label: "Kevin Tan\n1000000030",
    name: "Kevin Tan",
    accountNumber: "1000000030",
    risk: 82,
    status: "RESTRICTED",
    explanation: "High risk: Foreign national account. Received Rp 15M from Sri Wahyuni. All funds converted to USDT within 2 hours.",
    balance: 1200000,
    totalInflow: 25000000,
    totalOutflow: 23800000,
    depth: 2,
    children: ["e43"],
    parentEdges: ["e41"],
  },
  "d_l3_1": {
    id: "d_l3_1",
    label: "Binance P2P\n1000000031",
    name: "Binance P2P",
    accountNumber: "1000000031",
    risk: 75,
    status: "RESTRICTED",
    explanation: "High risk: P2P trading account linked to Kevin Tan and Bambang Wijaya. Large volume of crypto-fiat conversions. Under regulatory review.",
    balance: 50000000,
    totalInflow: 180000000,
    totalOutflow: 130000000,
    depth: 3,
    children: [],
    parentEdges: ["e42", "e43"],
  },

  // === TRAIL E: PT Maju Jaya ===
  "root5": {
    id: "root5",
    label: "PT. Maju Jaya\n1000000032",
    name: "PT. Maju Jaya",
    accountNumber: "1000000032",
    risk: 18,
    status: "ACTIVE",
    explanation: "Low risk: Established manufacturing company with 5+ years banking history. Regular payroll and supplier payments.",
    balance: 320000000,
    totalInflow: 1200000000,
    totalOutflow: 880000000,
    depth: 0,
    children: ["e44", "e45", "e46"],
    parentEdges: [],
  },
  "e_l1_1": {
    id: "e_l1_1",
    label: "Suprianto\n1000000033",
    name: "Suprianto",
    accountNumber: "1000000033",
    risk: 35,
    status: "ACTIVE",
    explanation: "Low-Medium risk: Employee of PT Maju Jaya receiving salary. Some after-hours transfers to family members.",
    balance: 18000000,
    totalInflow: 96000000,
    totalOutflow: 78000000,
    depth: 1,
    children: ["e47"],
    parentEdges: ["e44"],
  },
  "e_l1_2": {
    id: "e_l1_2",
    label: "CV. Sumber Rejeki\n1000000034",
    name: "CV. Sumber Rejeki",
    accountNumber: "1000000034",
    risk: 68,
    status: "FLAGGED",
    explanation: "Medium-High risk: Supplier receiving large payments from PT Maju Jaya. Business license questionable. Some transactions to personal accounts.",
    balance: 55000000,
    totalInflow: 280000000,
    totalOutflow: 225000000,
    depth: 1,
    children: ["e48", "e49"],
    parentEdges: ["e45"],
  },
  "e_l1_3": {
    id: "e_l1_3",
    label: "Tri Susanti\n1000000035",
    name: "Tri Susanti",
    accountNumber: "1000000035",
    risk: 28,
    status: "ACTIVE",
    explanation: "Low risk: Long-term supplier of raw materials. Payments consistent with delivery schedules. No anomalies.",
    balance: 42000000,
    totalInflow: 150000000,
    totalOutflow: 108000000,
    depth: 1,
    children: ["e50"],
    parentEdges: ["e46"],
  },
  "e_l2_1": {
    id: "e_l2_1",
    label: "Agus Priyono\n1000000036",
    name: "Agus Priyono",
    accountNumber: "1000000036",
    risk: 48,
    status: "FLAGGED",
    explanation: "Medium risk: Brother of Suprianto. Received Rp 5M salary transfer. Some transactions to gambling websites.",
    balance: 8200000,
    totalInflow: 22000000,
    totalOutflow: 13800000,
    depth: 2,
    children: [],
    parentEdges: ["e47"],
  },
  "e_l2_2": {
    id: "e_l2_2",
    label: "Hadi Sucipto\n1000000037",
    name: "Hadi Sucipto",
    accountNumber: "1000000037",
    risk: 77,
    status: "RESTRICTED",
    explanation: "High risk: Sub-contractor of CV Sumber Rejeki. Received Rp 20M. Funds split and sent to 3 different provinces within 1 hour.",
    balance: 2500000,
    totalInflow: 45000000,
    totalOutflow: 42500000,
    depth: 2,
    children: ["e51", "e52"],
    parentEdges: ["e48"],
  },
  "e_l2_3": {
    id: "e_l2_3",
    label: "PT. Mega Supplier\n1000000038",
    name: "PT. Mega Supplier",
    accountNumber: "1000000038",
    risk: 42,
    status: "ACTIVE",
    explanation: "Medium risk: Legitimate upstream supplier. Receives regular payments from CV Sumber Rejeki. Business verification passed.",
    balance: 95000000,
    totalInflow: 380000000,
    totalOutflow: 285000000,
    depth: 2,
    children: [],
    parentEdges: ["e49"],
  },
  "e_l2_4": {
    id: "e_l2_4",
    label: "Darmaji\n1000000039",
    name: "Darmaji",
    accountNumber: "1000000039",
    risk: 33,
    status: "ACTIVE",
    explanation: "Low-Medium risk: Delivery partner of Tri Susanti. Regular small payments for logistics services. Pattern consistent.",
    balance: 15000000,
    totalInflow: 48000000,
    totalOutflow: 33000000,
    depth: 2,
    children: [],
    parentEdges: ["e50"],
  },
  "e_l3_1": {
    id: "e_l3_1",
    label: "Siti Halimah\n1000000040",
    name: "Siti Halimah",
    accountNumber: "1000000040",
    risk: 86,
    status: "RESTRICTED",
    explanation: "High risk: Received Rp 12M from Hadi Sucipto. Dormant account for 6 months. Funds immediately transferred to prepaid card merchant.",
    balance: 800000,
    totalInflow: 18000000,
    totalOutflow: 17200000,
    depth: 3,
    children: [],
    parentEdges: ["e51"],
  },
  "e_l3_2": {
    id: "e_l3_2",
    label: "Rahmat Hidayat\n1000000041",
    name: "Rahmat Hidayat",
    accountNumber: "1000000041",
    risk: 90,
    status: "FROZEN",
    explanation: "CRITICAL: Terminal mule account. Received Rp 25M from Hadi Sucipto. 100% of funds withdrawn via ATM across 5 different cities in 3 hours.",
    balance: 300000,
    totalInflow: 45000000,
    totalOutflow: 44700000,
    depth: 3,
    children: [],
    parentEdges: ["e52"],
  },

  // === TRAIL F: Dina Pertiwi ===
  "root6": {
    id: "root6",
    label: "Dina Pertiwi\n1000000042",
    name: "Dina Pertiwi",
    accountNumber: "1000000042",
    risk: 22,
    status: "ACTIVE",
    explanation: "Low risk: University lecturer with stable monthly salary. Regular bill payments and occasional transfers to family.",
    balance: 56000000,
    totalInflow: 98000000,
    totalOutflow: 42000000,
    depth: 0,
    children: ["e53", "e54"],
    parentEdges: [],
  },
  "f_l1_1": {
    id: "f_l1_1",
    label: "Rudi Hermawan\n1000000043",
    name: "Rudi Hermawan",
    accountNumber: "1000000043",
    risk: 50,
    status: "FLAGGED",
    explanation: "Medium risk: Husband of Dina Pertiwi. Received Rp 10M joint account transfer. Some transactions to investment platforms with unclear legitimacy.",
    balance: 28000000,
    totalInflow: 55000000,
    totalOutflow: 27000000,
    depth: 1,
    children: ["e55", "e56"],
    parentEdges: ["e53"],
  },
  "f_l1_2": {
    id: "f_l1_2",
    label: "Sari Indah\n1000000044",
    name: "Sari Indah",
    accountNumber: "1000000044",
    risk: 32,
    status: "ACTIVE",
    explanation: "Low-Medium risk: Sister of Dina Pertiwi. Receives monthly family support. Transaction pattern stable and predictable.",
    balance: 22000000,
    totalInflow: 42000000,
    totalOutflow: 20000000,
    depth: 1,
    children: ["e57"],
    parentEdges: ["e54"],
  },
  "f_l2_1": {
    id: "f_l2_1",
    label: "Galih Permana\n1000000045",
    name: "Galih Permana",
    accountNumber: "1000000045",
    risk: 72,
    status: "RESTRICTED",
    explanation: "High risk: Investment platform operator. Received Rp 8M from Rudi Hermawan. Platform offers unrealistic 15% monthly returns. Under investigation.",
    balance: 4500000,
    totalInflow: 28000000,
    totalOutflow: 23500000,
    depth: 2,
    children: ["e58"],
    parentEdges: ["e55"],
  },
  "f_l2_2": {
    id: "f_l2_2",
    label: "Indah Wulandari\n1000000046",
    name: "Indah Wulandari",
    accountNumber: "1000000046",
    risk: 44,
    status: "FLAGGED",
    explanation: "Medium risk: Business partner of Rudi Hermawan. Received Rp 3.5M for joint venture. Documentation partial but under review.",
    balance: 15000000,
    totalInflow: 28000000,
    totalOutflow: 13000000,
    depth: 2,
    children: [],
    parentEdges: ["e56"],
  },
  "f_l3_1": {
    id: "f_l3_1",
    label: "Antonius Budi\n1000000047",
    name: "Antonius Budi",
    accountNumber: "1000000047",
    risk: 93,
    status: "FROZEN",
    explanation: "CRITICAL: Ponzi scheme mastermind. Received Rp 20M from Galih Permana. Funds distributed to 12 downline accounts. 200+ victims reported.",
    balance: 500000,
    totalInflow: 120000000,
    totalOutflow: 119500000,
    depth: 3,
    children: [],
    parentEdges: ["e58"],
  },

  // === TRAIL G: Irfan Hakim ===
  "root7": {
    id: "root7",
    label: "Irfan Hakim\n1000000048",
    name: "Irfan Hakim",
    accountNumber: "1000000048",
    risk: 28,
    status: "ACTIVE",
    explanation: "Low-Medium risk: Small business owner with regular transactions. Some cash deposits slightly above reporting threshold.",
    balance: 72000000,
    totalInflow: 180000000,
    totalOutflow: 108000000,
    depth: 0,
    children: ["e59", "e60"],
    parentEdges: [],
  },
  "g_l1_1": {
    id: "g_l1_1",
    label: "Nadia Sari\n1000000049",
    name: "Nadia Sari",
    accountNumber: "1000000049",
    risk: 60,
    status: "FLAGGED",
    explanation: "Medium-High risk: Supplier of Irfan Hakim. Received Rp 18M. Business address matches residential apartment. No commercial signage.",
    balance: 12000000,
    totalInflow: 65000000,
    totalOutflow: 53000000,
    depth: 1,
    children: ["e61", "e62"],
    parentEdges: ["e59"],
  },
  "g_l1_2": {
    id: "g_l1_2",
    label: "Fahri Abdullah\n1000000050",
    name: "Fahri Abdullah",
    accountNumber: "1000000050",
    risk: 43,
    status: "FLAGGED",
    explanation: "Medium risk: Contractor for Irfan Hakim. Receives project-based payments. Some transactions to family members in different cities.",
    balance: 35000000,
    totalInflow: 88000000,
    totalOutflow: 53000000,
    depth: 1,
    children: ["e63"],
    parentEdges: ["e60"],
  },
  "g_l2_1": {
    id: "g_l2_1",
    label: "Putri Anggraeni\n1000000051",
    name: "Putri Anggraeni",
    accountNumber: "1000000051",
    risk: 79,
    status: "RESTRICTED",
    explanation: "High risk: Daughter of Nadia Sari. Received Rp 10M. Account opened 2 weeks ago. All funds used for luxury goods online purchases.",
    balance: 2000000,
    totalInflow: 15000000,
    totalOutflow: 13000000,
    depth: 2,
    children: ["e64"],
    parentEdges: ["e61"],
  },
  "g_l2_2": {
    id: "g_l2_2",
    label: "PT. Global Impor\n1000000052",
    name: "PT. Global Impor",
    accountNumber: "1000000052",
    risk: 66,
    status: "FLAGGED",
    explanation: "Medium-High risk: Import company receiving from Nadia Sari. Customs records show minimal import activity. Possible invoice inflation.",
    balance: 68000000,
    totalInflow: 320000000,
    totalOutflow: 252000000,
    depth: 2,
    children: ["e65"],
    parentEdges: ["e62"],
  },
  "g_l3_1": {
    id: "g_l3_1",
    label: "Mega Mall Merchant\n1000000053",
    name: "Mega Mall Merchant",
    accountNumber: "1000000053",
    risk: 45,
    status: "ACTIVE",
    explanation: "Medium risk: Merchant receiving from Putri Anggraeni. Regular retail transactions. Some unusually high-value purchases flagged.",
    balance: 42000000,
    totalInflow: 180000000,
    totalOutflow: 138000000,
    depth: 3,
    children: [],
    parentEdges: ["e64"],
  },
  "g_l3_2": {
    id: "g_l3_2",
    label: "Offshore HK Ltd\n1000000054",
    name: "Offshore HK Ltd",
    accountNumber: "1000000054",
    risk: 84,
    status: "RESTRICTED",
    explanation: "High risk: Hong Kong shell company receiving from PT Global Impor. No verifiable business operations. Strong layering indicator.",
    balance: 120000000,
    totalInflow: 850000000,
    totalOutflow: 730000000,
    depth: 3,
    children: [],
    parentEdges: ["e65"],
  },

  // === TRAIL H: Sinta Dewi ===
  "root8": {
    id: "root8",
    label: "Sinta Dewi\n1000000055",
    name: "Sinta Dewi",
    accountNumber: "1000000055",
    risk: 12,
    status: "ACTIVE",
    explanation: "Very low risk: Government employee with 10+ years banking history. All transactions through official channels. No anomalies.",
    balance: 95000000,
    totalInflow: 145000000,
    totalOutflow: 50000000,
    depth: 0,
    children: ["e66", "e67"],
    parentEdges: [],
  },
  "h_l1_1": {
    id: "h_l1_1",
    label: "Arya Wibowo\n1000000056",
    name: "Arya Wibowo",
    accountNumber: "1000000056",
    risk: 37,
    status: "ACTIVE",
    explanation: "Low-Medium risk: Son of Sinta Dewi. University student receiving allowance. Some online gaming transactions.",
    balance: 8500000,
    totalInflow: 36000000,
    totalOutflow: 27500000,
    depth: 1,
    children: ["e68"],
    parentEdges: ["e66"],
  },
  "h_l1_2": {
    id: "h_l1_2",
    label: "Reni Susanti\n1000000057",
    name: "Reni Susanti",
    accountNumber: "1000000057",
    risk: 48,
    status: "FLAGGED",
    explanation: "Medium risk: Friend of Sinta Dewi. Received Rp 7M loan repayment. Some transactions to unregistered fintech platforms.",
    balance: 18000000,
    totalInflow: 32000000,
    totalOutflow: 14000000,
    depth: 1,
    children: ["e69", "e70"],
    parentEdges: ["e67"],
  },
  "h_l2_1": {
    id: "h_l2_1",
    label: "GameTopUp ID\n1000000058",
    name: "GameTopUp ID",
    accountNumber: "1000000058",
    risk: 58,
    status: "FLAGGED",
    explanation: "Medium-High risk: Gaming top-up merchant receiving from Arya Wibowo. High volume of small transactions. Some chargebacks reported.",
    balance: 28000000,
    totalInflow: 120000000,
    totalOutflow: 92000000,
    depth: 2,
    children: [],
    parentEdges: ["e68"],
  },
  "h_l2_2": {
    id: "h_l2_2",
    label: "Fintech X\n1000000059",
    name: "Fintech X",
    accountNumber: "1000000059",
    risk: 73,
    status: "RESTRICTED",
    explanation: "High risk: Unlicensed fintech platform. Received Rp 5M from Reni Susanti. Offers high-interest loans. Under OJK investigation.",
    balance: 45000000,
    totalInflow: 220000000,
    totalOutflow: 175000000,
    depth: 2,
    children: ["e71"],
    parentEdges: ["e69"],
  },
  "h_l2_3": {
    id: "h_l2_3",
    label: "Dedi Kurniawan\n1000000060",
    name: "Dedi Kurniawan",
    accountNumber: "1000000060",
    risk: 41,
    status: "FLAGGED",
    explanation: "Medium risk: Brother of Reni Susanti. Received Rp 3M family transfer. Account used for both personal and small business.",
    balance: 12000000,
    totalInflow: 25000000,
    totalOutflow: 13000000,
    depth: 2,
    children: [],
    parentEdges: ["e70"],
  },
  "h_l3_1": {
    id: "h_l3_1",
    label: "Loan Shark Network\n1000000061",
    name: "Loan Shark Network",
    accountNumber: "1000000061",
    risk: 94,
    status: "FROZEN",
    explanation: "CRITICAL: Illegal lending syndicate. Received Rp 15M from Fintech X. Interest rates exceed 300% per month. 50+ harassment complaints filed.",
    balance: 800000,
    totalInflow: 65000000,
    totalOutflow: 64200000,
    depth: 3,
    children: [],
    parentEdges: ["e71"],
  },
};

const edgesData: Record<string, TrailEdge> = {
  // === Trail A edges ===
  "e1": { id: "e1", source: "root1", target: "l1_1", label: "Rp 2.5M", amount: 2500000, date: "2026-05-14", channel: "Mobile Banking", isAnomaly: true },
  "e2": { id: "e2", source: "l1_1", target: "l2_1", label: "Rp 1.8M", amount: 1800000, date: "2026-05-13", channel: "ATM", isAnomaly: true },
  "e3": { id: "e3", source: "root2", target: "l1_1", label: "Rp 3.0M", amount: 3000000, date: "2026-05-14", channel: "Internet Banking", isAnomaly: true },
  "e4": { id: "e4", source: "root3", target: "c_l1_1", label: "Rp 900K", amount: 900000, date: "2026-05-12", channel: "Mobile Banking", isAnomaly: false },
  "e5": { id: "e5", source: "c_l1_1", target: "l2_1", label: "Rp 1.2M", amount: 1200000, date: "2026-05-12", channel: "ATM", isAnomaly: true },
  "e6": { id: "e6", source: "root1", target: "l1_3", label: "Rp 5.0M", amount: 5000000, date: "2026-05-11", channel: "Branch", isAnomaly: true },
  "e7": { id: "e7", source: "l1_1", target: "l2_2", label: "Rp 2.2M", amount: 2200000, date: "2026-05-13", channel: "Mobile Banking", isAnomaly: false },
  "e8": { id: "e8", source: "c_l1_1", target: "c_l2_1", label: "Rp 800K", amount: 800000, date: "2026-05-11", channel: "Internet Banking", isAnomaly: false },
  "e9": { id: "e9", source: "l1_3", target: "l2_4", label: "Rp 28M", amount: 28000000, date: "2026-05-10", channel: "Mobile Banking", isAnomaly: true },
  "e10": { id: "e10", source: "l1_3", target: "l2_5", label: "Rp 15M", amount: 15000000, date: "2026-05-09", channel: "Internet Banking", isAnomaly: true },
  "e11": { id: "e11", source: "l2_1", target: "l3_1", label: "Rp 4.5M", amount: 4500000, date: "2026-05-13", channel: "ATM", isAnomaly: true },
  "e12": { id: "e12", source: "l2_1", target: "l3_2", label: "Rp 20M", amount: 20000000, date: "2026-05-12", channel: "Branch", isAnomaly: true },
  "e13": { id: "e13", source: "l2_2", target: "l3_3", label: "Rp 5.6M", amount: 5600000, date: "2026-05-10", channel: "Internet Banking", isAnomaly: false },
  "e14": { id: "e14", source: "c_l2_1", target: "l3_4", label: "Rp 8M", amount: 8000000, date: "2026-05-08", channel: "Mobile Banking", isAnomaly: false },
  "e15": { id: "e15", source: "l2_4", target: "l3_1", label: "Rp 26.5M", amount: 26500000, date: "2026-05-09", channel: "ATM", isAnomaly: true },
  "e16": { id: "e16", source: "root1", target: "l2_2", label: "Rp 1.5M", amount: 1500000, date: "2026-05-15", channel: "Mobile Banking", isAnomaly: false },
  "e17": { id: "e17", source: "l1_1", target: "b_l1_2", label: "Rp 1.0M", amount: 1000000, date: "2026-05-14", channel: "Internet Banking", isAnomaly: false },
  "e18": { id: "e18", source: "l1_3", target: "b_l2_1", label: "Rp 3.5M", amount: 3500000, date: "2026-05-10", channel: "ATM", isAnomaly: true },
  "e19": { id: "e19", source: "l2_1", target: "b_l3_1", label: "Rp 6.0M", amount: 6000000, date: "2026-05-11", channel: "Branch", isAnomaly: true },
  "e20": { id: "e20", source: "l2_2", target: "f_l1_1", label: "Rp 2.0M", amount: 2000000, date: "2026-05-12", channel: "Mobile Banking", isAnomaly: false },
  "e21": { id: "e21", source: "l2_4", target: "g_l1_1", label: "Rp 4.0M", amount: 4000000, date: "2026-05-08", channel: "Internet Banking", isAnomaly: true },
  "e22": { id: "e22", source: "l2_5", target: "d_l1_1", label: "Rp 2.5M", amount: 2500000, date: "2026-05-07", channel: "ATM", isAnomaly: false },
  "e23": { id: "e23", source: "l3_1", target: "l4_1", label: "Rp 30M", amount: 30000000, date: "2026-05-08", channel: "Mobile Banking", isAnomaly: true },

  // === Trail B edges ===
  "e24": { id: "e24", source: "root2", target: "b_l1_1", label: "Rp 12M", amount: 12000000, date: "2026-05-13", channel: "Internet Banking", isAnomaly: true },
  "e25": { id: "e25", source: "b_l1_1", target: "l1_3", label: "Rp 5.5M", amount: 5500000, date: "2026-05-12", channel: "Mobile Banking", isAnomaly: true },
  "e26": { id: "e26", source: "b_l1_1", target: "b_l2_1", label: "Rp 7.0M", amount: 7000000, date: "2026-05-11", channel: "ATM", isAnomaly: true },
  "e27": { id: "e27", source: "b_l1_2", target: "b_l2_2", label: "Rp 4.5M", amount: 4500000, date: "2026-05-10", channel: "Internet Banking", isAnomaly: false },
  "e28": { id: "e28", source: "b_l1_2", target: "c_l2_1", label: "Rp 2.0M", amount: 2000000, date: "2026-05-09", channel: "Mobile Banking", isAnomaly: false },
  "e29": { id: "e29", source: "b_l2_1", target: "b_l3_1", label: "Rp 15M", amount: 15000000, date: "2026-05-10", channel: "Branch", isAnomaly: true },
  "e30": { id: "e30", source: "b_l2_1", target: "b_l3_2", label: "Rp 8M", amount: 8000000, date: "2026-05-09", channel: "ATM", isAnomaly: true },
  "e31": { id: "e31", source: "b_l2_2", target: "l2_1", label: "Rp 3.0M", amount: 3000000, date: "2026-05-08", channel: "Mobile Banking", isAnomaly: false },
  "e32": { id: "e32", source: "b_l3_1", target: "b_l4_1", label: "Rp 10M", amount: 10000000, date: "2026-05-07", channel: "Internet Banking", isAnomaly: true },

  // === Trail C edges ===
  "e33": { id: "e33", source: "root3", target: "l3_4", label: "Rp 2.0M", amount: 2000000, date: "2026-05-11", channel: "Branch", isAnomaly: false },
  "e34": { id: "e34", source: "root3", target: "l2_4", label: "Rp 1.5M", amount: 1500000, date: "2026-05-10", channel: "Mobile Banking", isAnomaly: false },
  "e35": { id: "e35", source: "c_l1_1", target: "c_l2_1", label: "Rp 1.2M", amount: 1200000, date: "2026-05-09", channel: "Internet Banking", isAnomaly: false },
  "e36": { id: "e36", source: "c_l2_1", target: "l3_2", label: "Rp 3.5M", amount: 3500000, date: "2026-05-07", channel: "ATM", isAnomaly: true },
  "e37": { id: "e37", source: "c_l3_1", target: "l3_3", label: "Rp 2.0M", amount: 2000000, date: "2026-05-06", channel: "Mobile Banking", isAnomaly: false },

  // === Trail D edges ===
  "e38": { id: "e38", source: "root4", target: "d_l1_1", label: "Rp 50M", amount: 50000000, date: "2026-05-14", channel: "Branch", isAnomaly: false },
  "e39": { id: "e39", source: "root4", target: "d_l1_2", label: "Rp 25M", amount: 25000000, date: "2026-05-13", channel: "Internet Banking", isAnomaly: true },
  "e40": { id: "e40", source: "d_l1_1", target: "d_l2_1", label: "Rp 8M", amount: 8000000, date: "2026-05-12", channel: "Mobile Banking", isAnomaly: false },
  "e41": { id: "e41", source: "d_l1_1", target: "d_l2_2", label: "Rp 15M", amount: 15000000, date: "2026-05-11", channel: "Internet Banking", isAnomaly: true },
  "e42": { id: "e42", source: "d_l1_2", target: "d_l3_1", label: "Rp 22M", amount: 22000000, date: "2026-05-10", channel: "Mobile Banking", isAnomaly: true },
  "e43": { id: "e43", source: "d_l2_2", target: "d_l3_1", label: "Rp 13M", amount: 13000000, date: "2026-05-09", channel: "ATM", isAnomaly: true },

  // === Trail E edges ===
  "e44": { id: "e44", source: "root5", target: "e_l1_1", label: "Rp 8M", amount: 8000000, date: "2026-05-15", channel: "Internet Banking", isAnomaly: false },
  "e45": { id: "e45", source: "root5", target: "e_l1_2", label: "Rp 35M", amount: 35000000, date: "2026-05-14", channel: "Mobile Banking", isAnomaly: true },
  "e46": { id: "e46", source: "root5", target: "e_l1_3", label: "Rp 12M", amount: 12000000, date: "2026-05-13", channel: "Branch", isAnomaly: false },
  "e47": { id: "e47", source: "e_l1_1", target: "e_l2_1", label: "Rp 5M", amount: 5000000, date: "2026-05-12", channel: "Mobile Banking", isAnomaly: false },
  "e48": { id: "e48", source: "e_l1_2", target: "e_l2_2", label: "Rp 20M", amount: 20000000, date: "2026-05-11", channel: "Internet Banking", isAnomaly: true },
  "e49": { id: "e49", source: "e_l1_2", target: "e_l2_3", label: "Rp 15M", amount: 15000000, date: "2026-05-10", channel: "Branch", isAnomaly: false },
  "e50": { id: "e50", source: "e_l1_3", target: "e_l2_4", label: "Rp 4.5M", amount: 4500000, date: "2026-05-11", channel: "Mobile Banking", isAnomaly: false },
  "e51": { id: "e51", source: "e_l2_2", target: "e_l3_1", label: "Rp 12M", amount: 12000000, date: "2026-05-09", channel: "ATM", isAnomaly: true },
  "e52": { id: "e52", source: "e_l2_2", target: "e_l3_2", label: "Rp 25M", amount: 25000000, date: "2026-05-08", channel: "Branch", isAnomaly: true },

  // === Trail F edges ===
  "e53": { id: "e53", source: "root6", target: "f_l1_1", label: "Rp 10M", amount: 10000000, date: "2026-05-14", channel: "Mobile Banking", isAnomaly: false },
  "e54": { id: "e54", source: "root6", target: "f_l1_2", label: "Rp 3M", amount: 3000000, date: "2026-05-13", channel: "Internet Banking", isAnomaly: false },
  "e55": { id: "e55", source: "f_l1_1", target: "f_l2_1", label: "Rp 8M", amount: 8000000, date: "2026-05-12", channel: "Mobile Banking", isAnomaly: true },
  "e56": { id: "e56", source: "f_l1_1", target: "f_l2_2", label: "Rp 3.5M", amount: 3500000, date: "2026-05-11", channel: "Internet Banking", isAnomaly: false },
  "e57": { id: "e57", source: "f_l1_2", target: "h_l1_2", label: "Rp 2M", amount: 2000000, date: "2026-05-10", channel: "ATM", isAnomaly: false },
  "e58": { id: "e58", source: "f_l2_1", target: "f_l3_1", label: "Rp 20M", amount: 20000000, date: "2026-05-09", channel: "Mobile Banking", isAnomaly: true },

  // === Trail G edges ===
  "e59": { id: "e59", source: "root7", target: "g_l1_1", label: "Rp 18M", amount: 18000000, date: "2026-05-14", channel: "Internet Banking", isAnomaly: false },
  "e60": { id: "e60", source: "root7", target: "g_l1_2", label: "Rp 5M", amount: 5000000, date: "2026-05-13", channel: "Mobile Banking", isAnomaly: false },
  "e61": { id: "e61", source: "g_l1_1", target: "g_l2_1", label: "Rp 10M", amount: 10000000, date: "2026-05-12", channel: "ATM", isAnomaly: true },
  "e62": { id: "e62", source: "g_l1_1", target: "g_l2_2", label: "Rp 22M", amount: 22000000, date: "2026-05-11", channel: "Internet Banking", isAnomaly: true },
  "e63": { id: "e63", source: "g_l1_2", target: "e_l1_1", label: "Rp 4M", amount: 4000000, date: "2026-05-10", channel: "Mobile Banking", isAnomaly: false },
  "e64": { id: "e64", source: "g_l2_1", target: "g_l3_1", label: "Rp 8M", amount: 8000000, date: "2026-05-09", channel: "Internet Banking", isAnomaly: false },
  "e65": { id: "e65", source: "g_l2_2", target: "g_l3_2", label: "Rp 18M", amount: 18000000, date: "2026-05-08", channel: "Branch", isAnomaly: true },

  // === Trail H edges ===
  "e66": { id: "e66", source: "root8", target: "h_l1_1", label: "Rp 4M", amount: 4000000, date: "2026-05-14", channel: "Mobile Banking", isAnomaly: false },
  "e67": { id: "e67", source: "root8", target: "h_l1_2", label: "Rp 7M", amount: 7000000, date: "2026-05-13", channel: "Internet Banking", isAnomaly: false },
  "e68": { id: "e68", source: "h_l1_1", target: "h_l2_1", label: "Rp 2.5M", amount: 2500000, date: "2026-05-12", channel: "Mobile Banking", isAnomaly: false },
  "e69": { id: "e69", source: "h_l1_2", target: "h_l2_2", label: "Rp 5M", amount: 5000000, date: "2026-05-11", channel: "Internet Banking", isAnomaly: true },
  "e70": { id: "e70", source: "h_l1_2", target: "h_l2_3", label: "Rp 3M", amount: 3000000, date: "2026-05-10", channel: "ATM", isAnomaly: false },
  "e71": { id: "e71", source: "h_l2_2", target: "h_l3_1", label: "Rp 15M", amount: 15000000, date: "2026-05-09", channel: "Mobile Banking", isAnomaly: true },
};

// Root nodes (starting points) with metadata for the selector
const ROOT_ACCOUNTS = [
  { id: "root1", name: "Budi Santoso", accountNumber: "1000000001", risk: 15, desc: "Individual - Jakarta" },
  { id: "root2", name: "Ani Wijaya", accountNumber: "1000000002", risk: 25, desc: "Individual - Surabaya" },
  { id: "root3", name: "Maya Sari", accountNumber: "1000000006", risk: 10, desc: "Individual - Bandung" },
  { id: "root4", name: "Agus Salim", accountNumber: "1000000026", risk: 20, desc: "Individual - Yogyakarta" },
  { id: "root5", name: "PT. Maju Jaya", accountNumber: "1000000032", risk: 18, desc: "Corporate - Jakarta" },
  { id: "root6", name: "Dina Pertiwi", accountNumber: "1000000042", risk: 22, desc: "Individual - Malang" },
  { id: "root7", name: "Irfan Hakim", accountNumber: "1000000048", risk: 28, desc: "Individual - Semarang" },
  { id: "root8", name: "Sinta Dewi", accountNumber: "1000000055", risk: 12, desc: "Individual - Bali" },
];

// ============================================================================
// COMPONENTS
// ============================================================================

function getNodeColor(risk: number, status: string) {
  if (status === "FROZEN") return "#7f1d1d";
  if (risk >= 90) return "#dc2626";
  if (risk >= 70) return "#ef4444";
  if (risk >= 50) return "#f97316";
  if (risk >= 30) return "#eab308";
  return "#003366";
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
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-bold text-gray-900 text-sm">{node.name}</h4>
            <p className="text-xs text-gray-500 font-mono">{node.accountNumber}</p>
          </div>
          <Badge variant={getStatusBadgeVariant(node.status)} className="text-xs">
            {node.status}
          </Badge>
        </div>

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

        <div className="mb-3 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center gap-1.5 mb-1">
            <Info className="w-3 h-3 text-blue-600" />
            <span className="text-xs font-semibold text-blue-800">AI Explanation</span>
          </div>
          <p className="text-xs text-blue-700 leading-relaxed">{node.explanation}</p>
        </div>

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

        <div className="mt-2 flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${node.depth === 0 ? "bg-blue-500" : node.depth === 1 ? "bg-orange-500" : node.depth === 2 ? "bg-red-500" : "bg-red-700"}`} />
          <span className="text-[10px] text-gray-400">
            Hop {node.depth} {node.depth === 0 ? "(Source)" : node.depth >= 3 ? "(Terminal)" : ""}
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
  const [selectedRootId, setSelectedRootId] = useState<string>("root1");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["root1"]));
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, nodeId: null });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const cyRef = useRef<any>(null);

  // Get all nodes reachable from the selected root
  const getReachableNodes = useCallback((rootId: string): Set<string> => {
    const reachable = new Set<string>();
    const queue = [rootId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (reachable.has(current)) continue;
      reachable.add(current);
      const node = nodesData[current];
      if (node) {
        node.children.forEach((edgeId) => {
          const edge = edgesData[edgeId];
          if (edge) queue.push(edge.target);
        });
      }
    }
    return reachable;
  }, []);

  // Build cytoscape elements based on selected root and expanded nodes
  const cytoscapeElements = useCallback(() => {
    const elements: any[] = [];
    const visibleNodeIds = new Set<string>();
    const reachableNodes = getReachableNodes(selectedRootId);

    // Always include the selected root
    visibleNodeIds.add(selectedRootId);

    // Include expanded nodes and their children (only if reachable)
    expandedNodes.forEach((nodeId) => {
      if (!reachableNodes.has(nodeId)) return;
      const node = nodesData[nodeId];
      if (!node) return;

      node.children.forEach((edgeId) => {
        const edge = edgesData[edgeId];
        if (!edge || !reachableNodes.has(edge.target)) return;
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
          width: node.depth === 0 ? 90 : node.depth >= 3 ? 70 : 80,
          height: node.depth === 0 ? 90 : node.depth >= 3 ? 70 : 80,
          "font-size": node.depth === 0 ? 11 : 9,
          "text-max-width": node.depth === 0 ? 80 : 70,
        },
      });
    });

    // Add visible edges
    expandedNodes.forEach((nodeId) => {
      if (!reachableNodes.has(nodeId)) return;
      const node = nodesData[nodeId];
      if (!node) return;

      node.children.forEach((edgeId) => {
        const edge = edgesData[edgeId];
        if (!edge || !visibleNodeIds.has(edge.target) || !visibleNodeIds.has(edge.source)) return;

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
  }, [expandedNodes, selectedNode, selectedRootId, getReachableNodes]);

  // When root changes, reset expanded nodes to just the new root
  useEffect(() => {
    setExpandedNodes(new Set([selectedRootId]));
    setSelectedNode(null);
  }, [selectedRootId]);

  const handleNodeClick = useCallback((nodeId: string) => {
    const node = nodesData[nodeId];
    if (!node || node.children.length === 0) {
      setSelectedNode(nodeId);
      return;
    }

    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
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
        next.add(nodeId);
      }
      return next;
    });

    setSelectedNode(nodeId);
  }, []);

  const expandAll = useCallback(() => {
    const reachable = getReachableNodes(selectedRootId);
    setExpandedNodes(new Set(reachable));
  }, [selectedRootId, getReachableNodes]);

  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set([selectedRootId]));
  }, [selectedRootId]);

  // Ledger data (expanded)
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
    { id: 16, sender: "Andi Wijaya", recipient: "Fajar Nugroho", amount: 30000000, date: "2026-05-08", channel: "Mobile Banking", ip: "10.0.0.15", anomaly: true },
    { id: 17, sender: "Ani Wijaya", recipient: "Hendra Gunawan", amount: 12000000, date: "2026-05-13", channel: "Internet Banking", ip: "192.168.2.101", anomaly: true },
    { id: 18, sender: "Hendra Gunawan", recipient: "Doni Saputra", amount: 7000000, date: "2026-05-11", channel: "ATM", ip: "10.0.0.33", anomaly: true },
    { id: 19, sender: "Doni Saputra", recipient: "PT. Delta Nusantara", amount: 15000000, date: "2026-05-10", channel: "Branch", ip: "10.0.0.33", anomaly: true },
    { id: 20, sender: "Doni Saputra", recipient: "Wawan Setiawan", amount: 8000000, date: "2026-05-09", channel: "ATM", ip: "10.0.0.33", anomaly: true },
    { id: 21, sender: "PT. Delta Nusantara", recipient: "Yusuf Ibrahim", amount: 10000000, date: "2026-05-07", channel: "Internet Banking", ip: "203.89.12.55", anomaly: true },
    { id: 22, sender: "Agus Salim", recipient: "Sri Wahyuni", amount: 50000000, date: "2026-05-14", channel: "Branch", ip: "192.168.10.1", anomaly: false },
    { id: 23, sender: "Agus Salim", recipient: "Bambang Wijaya", amount: 25000000, date: "2026-05-13", channel: "Internet Banking", ip: "192.168.10.1", anomaly: true },
    { id: 24, sender: "Sri Wahyuni", recipient: "Kevin Tan", amount: 15000000, date: "2026-05-11", channel: "Internet Banking", ip: "192.168.10.5", anomaly: true },
    { id: 25, sender: "Bambang Wijaya", recipient: "Binance P2P", amount: 22000000, date: "2026-05-10", channel: "Mobile Banking", ip: "192.168.10.8", anomaly: true },
    { id: 26, sender: "PT. Maju Jaya", recipient: "Suprianto", amount: 8000000, date: "2026-05-15", channel: "Internet Banking", ip: "192.168.20.1", anomaly: false },
    { id: 27, sender: "PT. Maju Jaya", recipient: "CV. Sumber Rejeki", amount: 35000000, date: "2026-05-14", channel: "Mobile Banking", ip: "192.168.20.1", anomaly: true },
    { id: 28, sender: "CV. Sumber Rejeki", recipient: "Hadi Sucipto", amount: 20000000, date: "2026-05-11", channel: "Internet Banking", ip: "192.168.20.15", anomaly: true },
    { id: 29, sender: "Hadi Sucipto", recipient: "Siti Halimah", amount: 12000000, date: "2026-05-09", channel: "ATM", ip: "10.0.0.44", anomaly: true },
    { id: 30, sender: "Hadi Sucipto", recipient: "Rahmat Hidayat", amount: 25000000, date: "2026-05-08", channel: "Branch", ip: "10.0.0.44", anomaly: true },
    { id: 31, sender: "Dina Pertiwi", recipient: "Rudi Hermawan", amount: 10000000, date: "2026-05-14", channel: "Mobile Banking", ip: "192.168.30.1", anomaly: false },
    { id: 32, sender: "Rudi Hermawan", recipient: "Galih Permana", amount: 8000000, date: "2026-05-12", channel: "Mobile Banking", ip: "192.168.30.5", anomaly: true },
    { id: 33, sender: "Galih Permana", recipient: "Antonius Budi", amount: 20000000, date: "2026-05-09", channel: "Mobile Banking", ip: "203.89.12.66", anomaly: true },
    { id: 34, sender: "Irfan Hakim", recipient: "Nadia Sari", amount: 18000000, date: "2026-05-14", channel: "Internet Banking", ip: "192.168.40.1", anomaly: false },
    { id: 35, sender: "Nadia Sari", recipient: "PT. Global Impor", amount: 22000000, date: "2026-05-11", channel: "Internet Banking", ip: "192.168.40.5", anomaly: true },
    { id: 36, sender: "PT. Global Impor", recipient: "Offshore HK Ltd", amount: 18000000, date: "2026-05-08", channel: "Branch", ip: "203.89.12.77", anomaly: true },
    { id: 37, sender: "Sinta Dewi", recipient: "Reni Susanti", amount: 7000000, date: "2026-05-13", channel: "Internet Banking", ip: "192.168.50.1", anomaly: false },
    { id: 38, sender: "Reni Susanti", recipient: "Fintech X", amount: 5000000, date: "2026-05-11", channel: "Internet Banking", ip: "192.168.50.5", anomaly: true },
    { id: 39, sender: "Fintech X", recipient: "Loan Shark Network", amount: 15000000, date: "2026-05-09", channel: "Mobile Banking", ip: "203.89.12.88", anomaly: true },
  ];

  const filteredTransactions = mockTransactions.filter((tx) => {
    const matchesSearch =
      tx.sender.toLowerCase().includes(search.toLowerCase()) ||
      tx.recipient.toLowerCase().includes(search.toLowerCase());
    const matchesAnomaly = filterAnomaly ? tx.anomaly : true;
    return matchesSearch && matchesAnomaly;
  });

  const selectedNodeData = selectedNode ? nodesData[selectedNode] : null;
  const selectedRootData = ROOT_ACCOUNTS.find((r) => r.id === selectedRootId);

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
            {/* Account Selector & Controls */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="w-full sm:w-auto flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">Money Trail Visualization</h2>
                  <p className="text-sm text-gray-500">
                    Select a source account to trace fund flow. Click nodes to expand/collapse.
                  </p>
                </div>
              </div>

              {/* Account Selector */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <label className="text-xs font-semibold text-gray-700 mb-2 block">Select Source Account</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {ROOT_ACCOUNTS.map((account) => (
                    <button
                      key={account.id}
                      onClick={() => setSelectedRootId(account.id)}
                      className={`text-left p-2.5 rounded-lg border transition-all text-xs ${
                        selectedRootId === account.id
                          ? "border-bi-navy bg-blue-50 ring-1 ring-bi-navy"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900 truncate">{account.name}</span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                          account.risk >= 50 ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
                        }`}>
                          {account.risk}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">{account.accountNumber}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{account.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  {selectedRootData && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`w-3 h-3 rounded-full ${selectedRootData.risk >= 50 ? "bg-orange-500" : "bg-green-500"}`} />
                      <span className="font-medium text-gray-900">{selectedRootData.name}</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-500">{selectedRootData.accountNumber}</span>
                    </div>
                  )}
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
