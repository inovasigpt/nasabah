import { prisma } from "@/lib/prisma";
import {
  AlertTriangle,
  Ticket,
  Lock,
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { ComplaintTrendChart, FraudRegionChart } from "@/components/dashboard/charts";
import { Badge } from "@/components/ui/badge";

async function getDashboardStats() {
  const [
    totalAccounts,
    frozenAccounts,
    openComplaints,
    totalTransactions,
    anomalyTransactions,
    highRiskAccounts,
    recentComplaints,
    recentTransactions,
  ] = await Promise.all([
    prisma.account.count(),
    prisma.account.count({ where: { status: "FROZEN" } }),
    prisma.complaint.count({ where: { status: { in: ["OPEN", "IN_PROGRESS", "ESCALATED"] } } }),
    prisma.transaction.count(),
    prisma.transaction.count({ where: { isAnomaly: true } }),
    prisma.account.count({ where: { riskScore: { gte: 70 } } }),
    prisma.complaint.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { account: true },
    }),
    prisma.transaction.findMany({
      take: 5,
      orderBy: { timestamp: "desc" },
      include: { sender: true, recipient: true },
    }),
  ]);

  return {
    totalAccounts,
    frozenAccounts,
    openComplaints,
    totalTransactions,
    anomalyTransactions,
    highRiskAccounts,
    recentComplaints,
    recentTransactions,
  };
}

const complaintTrendData = [
  { month: "Jan", complaints: 12, resolved: 8 },
  { month: "Feb", complaints: 18, resolved: 14 },
  { month: "Mar", complaints: 15, resolved: 12 },
  { month: "Apr", complaints: 22, resolved: 18 },
  { month: "May", complaints: 28, resolved: 20 },
  { month: "Jun", complaints: 24, resolved: 22 },
];

const fraudRegionData = [
  { region: "Jakarta", count: 45 },
  { region: "Surabaya", count: 28 },
  { region: "Bandung", count: 18 },
  { region: "Medan", count: 12 },
  { region: "Makassar", count: 8 },
];

function getStatusVariant(status: string) {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "FLAGGED":
      return "warning";
    case "RESTRICTED":
      return "danger";
    case "FROZEN":
      return "danger";
    default:
      return "default";
  }
}

function getComplaintStatusVariant(status: string) {
  switch (status) {
    case "OPEN":
      return "warning";
    case "IN_PROGRESS":
      return "info";
    case "ESCALATED":
      return "danger";
    case "RESOLVED":
      return "success";
    default:
      return "default";
  }
}

function getPriorityVariant(score: number) {
  if (score >= 70) return "danger";
  if (score >= 40) return "warning";
  return "success";
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const kpis = [
    {
      title: "Total Accounts",
      value: stats.totalAccounts,
      icon: Users,
      color: "bg-blue-50 text-blue-700",
      iconColor: "text-blue-600",
      href: "/accounts",
    },
    {
      title: "Frozen Accounts",
      value: stats.frozenAccounts,
      icon: Lock,
      color: "bg-red-50 text-red-700",
      iconColor: "text-red-600",
      href: "/security",
    },
    {
      title: "Open Complaints",
      value: stats.openComplaints,
      icon: Ticket,
      color: "bg-orange-50 text-orange-700",
      iconColor: "text-orange-600",
      href: "/complaints",
    },
    {
      title: "High Risk Accounts",
      value: stats.highRiskAccounts,
      icon: AlertTriangle,
      color: "bg-rose-50 text-rose-700",
      iconColor: "text-rose-600",
      href: "/investigation",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Executive Dashboard</h1>
        <p className="text-gray-500 mt-1">Real-time overview of fraud detection and complaint management</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Link
            key={kpi.title}
            href={kpi.href}
            className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{kpi.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${kpi.color}`}>
                <kpi.icon className={`w-6 h-6 ${kpi.iconColor}`} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Complaint Trends</h2>
            <span className="text-sm text-gray-500">Monthly</span>
          </div>
          <ComplaintTrendChart data={complaintTrendData} />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Fraud by Region</h2>
            <span className="text-sm text-gray-500">Year to date</span>
          </div>
          <FraudRegionChart data={fraudRegionData} />
        </div>
      </div>

      {/* Transaction Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Transaction Overview</h2>
            <span className="text-sm text-gray-500">Last 30 days</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Activity className="w-4 h-4" />
                <span className="text-sm">Total Transactions</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 text-red-600 mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">Anomalies Detected</span>
              </div>
              <p className="text-2xl font-bold text-red-700">{stats.anomalyTransactions}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+12% from last month</span>
            </div>
            <div className="flex items-center gap-1 text-red-600">
              <TrendingDown className="w-4 h-4" />
              <span>Fraud rate: 2.3%</span>
            </div>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Low Risk (0-30)</span>
                <span className="font-medium text-gray-900">
                  {Math.max(0, stats.totalAccounts - stats.highRiskAccounts - stats.frozenAccounts)}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: "60%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Medium Risk (31-70)</span>
                <span className="font-medium text-gray-900">3</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: "25%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">High Risk (71-90)</span>
                <span className="font-medium text-gray-900">
                  {Math.max(0, stats.highRiskAccounts - stats.frozenAccounts)}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: "10%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Critical (&gt;90)</span>
                <span className="font-medium text-gray-900">{stats.frozenAccounts}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-700 rounded-full" style={{ width: "5%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Complaints */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Complaints</h2>
            <Link href="/complaints" className="text-sm text-bi-navy hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentComplaints.map((complaint) => (
              <div key={complaint.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-500">{complaint.ticketId}</span>
                    <Badge variant={getComplaintStatusVariant(complaint.status)}>{complaint.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-900 mt-1">{complaint.account.accountHolder}</p>
                  <p className="text-xs text-gray-500">{complaint.category.replace("_", " ")}</p>
                </div>
                <Badge variant={getPriorityVariant(complaint.aiPriorityScore)}>
                  P{complaint.aiPriorityScore}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            <Link href="/investigation" className="text-sm text-bi-navy hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{tx.sender.accountHolder}</span>
                    <span className="text-xs text-gray-400">→</span>
                    <span className="text-sm font-medium text-gray-900">{tx.recipient.accountHolder}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Rp {Number(tx.amount).toLocaleString("id-ID")} • {tx.channel}
                  </p>
                </div>
                {tx.isAnomaly ? (
                  <Badge variant="danger">Anomaly</Badge>
                ) : (
                  <Badge variant="success">Normal</Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <div>
              <p className="text-sm font-medium text-green-800">AI Risk Engine</p>
              <p className="text-xs text-green-600">Operational</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <div>
              <p className="text-sm font-medium text-green-800">Database (Neon)</p>
              <p className="text-xs text-green-600">Connected</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <div>
              <p className="text-sm font-medium text-green-800">Audit Logging</p>
              <p className="text-xs text-green-600">Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
