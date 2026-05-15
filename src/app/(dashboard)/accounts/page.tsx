import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface AccountsPageProps {
  searchParams: {
    q?: string;
    status?: string;
    sort?: string;
    page?: string;
  };
}

const ITEMS_PER_PAGE = 10;

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

function getRiskVariant(score: number) {
  if (score >= 90) return "danger";
  if (score >= 70) return "danger";
  if (score >= 50) return "warning";
  return "success";
}

export default async function AccountsPage({ searchParams }: AccountsPageProps) {
  const query = searchParams.q || "";
  const statusFilter = searchParams.status || "";
  const sortField = searchParams.sort || "riskScore";
  const page = parseInt(searchParams.page || "1", 10);

  const where: any = {
    AND: [
      query
        ? {
            OR: [
              { accountHolder: { contains: query, mode: "insensitive" } },
              { accountNumber: { contains: query, mode: "insensitive" } },
            ],
          }
        : {},
      statusFilter ? { status: statusFilter } : {},
    ],
  };

  const orderBy =
    sortField === "balance"
      ? { balance: "desc" as const }
      : sortField === "name"
      ? { accountHolder: "asc" as const }
      : { riskScore: "desc" as const };

  const [accounts, totalCount] = await Promise.all([
    prisma.account.findMany({
      where,
      orderBy,
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    prisma.account.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const statusOptions = ["ACTIVE", "FLAGGED", "RESTRICTED", "FROZEN"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account Management</h1>
          <p className="text-gray-500 mt-1">Monitor and manage customer accounts & risk profiles</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <form className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              name="q"
              defaultValue={query}
              placeholder="Search by name or account number..."
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              name="status"
              defaultValue={statusFilter}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-bi-navy"
            >
              <option value="">All Statuses</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              name="sort"
              defaultValue={sortField}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-bi-navy"
            >
              <option value="riskScore">Risk Score</option>
              <option value="balance">Balance</option>
              <option value="name">Name</option>
            </select>
            <Button type="submit" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">Account Number</th>
                <th className="px-6 py-4 font-semibold">Account Holder</th>
                <th className="px-6 py-4 font-semibold">Balance</th>
                <th className="px-6 py-4 font-semibold">Risk Score</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No accounts found matching your criteria
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-900">{account.accountNumber}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{account.accountHolder}</td>
                    <td className="px-6 py-4 text-gray-700">
                      Rp {Number(account.balance).toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getRiskVariant(account.riskScore)}>{account.riskScore}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusVariant(account.status)}>{account.status}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/accounts/${account.id}`}
                        className="text-bi-navy hover:underline text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * ITEMS_PER_PAGE + 1} to {Math.min(page * ITEMS_PER_PAGE, totalCount)} of{" "}
            {totalCount} accounts
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={`/accounts?q=${query}&status=${statusFilter}&sort=${sortField}&page=${page - 1}`}
              className={`p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 ${
                page <= 1 ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <span className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </span>
            <Link
              href={`/accounts?q=${query}&status=${statusFilter}&sort=${sortField}&page=${page + 1}`}
              className={`p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 ${
                page >= totalPages ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
