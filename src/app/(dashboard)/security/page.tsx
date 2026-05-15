import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, ShieldAlert, Unlock, Clock } from "lucide-react";
import { verifySession } from "@/lib/session";

async function getFrozenAccounts() {
  const accounts = await prisma.account.findMany({
    where: { status: "FROZEN" },
    include: {
      freezeLogs: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
  return accounts;
}

export default async function SecurityPage() {
  const session = await verifySession();
  const frozenAccounts = await getFrozenAccounts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Security & Actions</h1>
        <p className="text-gray-500 mt-1">Account status management and freeze controls</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 rounded-lg">
              <Lock className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Frozen Accounts</p>
              <p className="text-2xl font-bold text-gray-900">{frozenAccounts.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 rounded-lg">
              <ShieldAlert className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Restricted Accounts</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg. Freeze Duration</p>
              <p className="text-2xl font-bold text-gray-900">12h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Frozen Accounts Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Frozen Accounts (Sandi 07)</h2>
          <Badge variant="danger" className="text-sm">
            <Lock className="w-3 h-3 mr-1" />
            Auto-Frozen by System
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">Account Number</th>
                <th className="px-6 py-4 font-semibold">Account Holder</th>
                <th className="px-6 py-4 font-semibold">Risk Score</th>
                <th className="px-6 py-4 font-semibold">Reason Code</th>
                <th className="px-6 py-4 font-semibold">Triggered By</th>
                <th className="px-6 py-4 font-semibold">Frozen At</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {frozenAccounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    No frozen accounts at this time
                  </td>
                </tr>
              ) : (
                frozenAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-900">{account.accountNumber}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{account.accountHolder}</td>
                    <td className="px-6 py-4">
                      <Badge variant="danger">{account.riskScore}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="danger">07</Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {account.freezeLogs[0]?.triggeredBy || "SYSTEM"}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {account.freezeLogs[0]?.createdAt
                        ? new Date(account.freezeLogs[0].createdAt).toLocaleString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      {session?.role === "INVESTIGATOR" || session?.role === "ADMIN" ? (
                        <form action="/api/accounts/unfreeze" method="POST">
                          <input type="hidden" name="accountId" value={account.id} />
                          <Button type="submit" variant="outline" size="sm">
                            <Unlock className="w-3 h-3 mr-1" />
                            Unfreeze
                          </Button>
                        </form>
                      ) : (
                        <span className="text-xs text-gray-400">Investigator only</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Intervention Protocol Reference */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Intervention Protocol (POJK 39/2019)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <p className="text-xs text-green-600 font-medium uppercase">Risk 0-30</p>
            <p className="text-sm font-bold text-green-800 mt-1">Normal</p>
            <p className="text-xs text-green-700 mt-1">Auto-approved</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
            <p className="text-xs text-orange-600 font-medium uppercase">Risk 31-70</p>
            <p className="text-sm font-bold text-orange-800 mt-1">Flagged</p>
            <p className="text-xs text-orange-700 mt-1">Step-up auth required</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-100">
            <p className="text-xs text-red-600 font-medium uppercase">Risk 71-90</p>
            <p className="text-sm font-bold text-red-800 mt-1">Restricted</p>
            <p className="text-xs text-red-700 mt-1">Manual review (10 min SLA)</p>
          </div>
          <div className="p-4 bg-red-100 rounded-lg border border-red-200">
            <p className="text-xs text-red-700 font-medium uppercase">Risk &gt;90</p>
            <p className="text-sm font-bold text-red-900 mt-1">Frozen (Sandi 07)</p>
            <p className="text-xs text-red-800 mt-1">Auto-block + notify customer</p>
          </div>
        </div>
      </div>
    </div>
  );
}
