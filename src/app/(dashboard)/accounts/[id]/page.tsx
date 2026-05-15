import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Wallet, ShieldAlert, Activity } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface AccountDetailPageProps {
  params: {
    id: string;
  };
}

function getStatusVariant(status: string) {
  switch (status) {
    case "ACTIVE": return "success";
    case "FLAGGED": return "warning";
    case "RESTRICTED": return "danger";
    case "FROZEN": return "danger";
    default: return "default";
  }
}

function getRiskVariant(score: number) {
  if (score >= 90) return "danger";
  if (score >= 70) return "danger";
  if (score >= 50) return "warning";
  return "success";
}

export default async function AccountDetailPage({ params }: AccountDetailPageProps) {
  const account = await prisma.account.findUnique({
    where: { id: parseInt(params.id, 10) },
    include: {
      sentTransactions: { orderBy: { timestamp: "desc" }, take: 5 },
      receivedTransactions: { orderBy: { timestamp: "desc" }, take: 5 },
      complaints: { orderBy: { createdAt: "desc" }, take: 5 },
      freezeLogs: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!account) {
    notFound();
  }

  const allTransactions = [
    ...account.sentTransactions.map((t) => ({ ...t, type: "Sent" as const })),
    ...account.receivedTransactions.map((t) => ({ ...t, type: "Received" as const })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/accounts">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Accounts
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account Detail</h1>
          <p className="text-gray-500 text-sm font-mono">{account.accountNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{account.accountHolder}</h2>
                  <p className="text-sm text-gray-500">Customer Account</p>
                </div>
              </div>
              <Badge variant={getStatusVariant(account.status)} className="text-sm">
                {account.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Wallet className="w-4 h-4" />
                  <span className="text-sm">Balance</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  Rp {Number(account.balance).toLocaleString("id-ID")}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <ShieldAlert className="w-4 h-4" />
                  <span className="text-sm">Risk Score</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  <Badge variant={getRiskVariant(account.riskScore)} className="text-lg">
                    {account.riskScore}/100
                  </Badge>
                </p>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
            {allTransactions.length === 0 ? (
              <p className="text-gray-400 text-sm">No recent transactions</p>
            ) : (
              <div className="space-y-2">
                {allTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Activity className={`w-4 h-4 ${tx.type === "Sent" ? "text-orange-500" : "text-green-500"}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{tx.type}</p>
                        <p className="text-xs text-gray-500">{tx.channel} • {new Date(tx.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        Rp {Number(tx.amount).toLocaleString("id-ID")}
                      </p>
                      {tx.isAnomaly && <Badge variant="danger" className="text-xs mt-1">Anomaly</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Account Info</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Account Number</p>
                <p className="text-sm font-mono text-gray-900">{account.accountNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Holder Name</p>
                <p className="text-sm font-medium text-gray-900">{account.accountHolder}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <Badge variant={getStatusVariant(account.status)}>{account.status}</Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500">Risk Score</p>
                <Badge variant={getRiskVariant(account.riskScore)}>{account.riskScore}</Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500">Created At</p>
                <p className="text-sm text-gray-700">{new Date(account.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {account.freezeLogs.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Freeze History</h3>
              <div className="space-y-3">
                {account.freezeLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex items-center justify-between">
                      <Badge variant="danger">Code {log.reasonCode}</Badge>
                      <span className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-gray-700 mt-1">Triggered by: {log.triggeredBy}</p>
                    {log.unfrozenAt && (
                      <p className="text-xs text-green-700 mt-1">Unfrozen by {log.unfrozenBy} on {new Date(log.unfrozenAt).toLocaleDateString()}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
