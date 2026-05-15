import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface ComplaintsPageProps {
  searchParams: {
    q?: string;
    status?: string;
    category?: string;
    priority?: string;
    page?: string;
  };
}

const ITEMS_PER_PAGE = 10;

function getStatusVariant(status: string) {
  switch (status) {
    case "OPEN":
      return "warning";
    case "IN_PROGRESS":
      return "info";
    case "ESCALATED":
      return "danger";
    case "RESOLVED":
      return "success";
    case "CLOSED":
      return "default";
    default:
      return "default";
  }
}

function getPriorityVariant(score: number) {
  if (score >= 70) return "danger";
  if (score >= 40) return "warning";
  return "success";
}

function getPriorityLabel(score: number) {
  if (score >= 70) return "High";
  if (score >= 40) return "Mid";
  return "Low";
}

export default async function ComplaintsPage({ searchParams }: ComplaintsPageProps) {
  const query = searchParams.q || "";
  const statusFilter = searchParams.status || "";
  const categoryFilter = searchParams.category || "";
  const priorityFilter = searchParams.priority || "";
  const page = parseInt(searchParams.page || "1", 10);

  const where: any = {
    AND: [
      query
        ? {
            OR: [
              { ticketId: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
              { account: { accountHolder: { contains: query, mode: "insensitive" } } },
            ],
          }
        : {},
      statusFilter ? { status: statusFilter } : {},
      categoryFilter ? { category: categoryFilter } : {},
      priorityFilter
        ? priorityFilter === "high"
          ? { aiPriorityScore: { gte: 70 } }
          : priorityFilter === "mid"
          ? { aiPriorityScore: { gte: 40, lt: 70 } }
          : { aiPriorityScore: { lt: 40 } }
        : {},
    ],
  };

  const [complaints, totalCount] = await Promise.all([
    prisma.complaint.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      include: { account: true },
    }),
    prisma.complaint.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const statusOptions = ["OPEN", "IN_PROGRESS", "ESCALATED", "RESOLVED", "CLOSED"];
  const categoryOptions = ["PHISHING", "SKIMMING", "SOCIAL_ENGINEERING", "UNAUTHORIZED_TRANSACTION", "ACCOUNT_TAKEOVER", "OTHER"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Complaint Center</h1>
          <p className="text-gray-500 mt-1">Manage and triage customer complaints with AI-powered prioritization</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="danger" className="px-3 py-1">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {totalCount} Total
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <form className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              name="q"
              defaultValue={query}
              placeholder="Search ticket ID, description, or customer name..."
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              name="status"
              defaultValue={statusFilter}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-bi-navy"
            >
              <option value="">All Status</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
            <select
              name="category"
              defaultValue={categoryFilter}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-bi-navy"
            >
              <option value="">All Categories</option>
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {c.replace("_", " ")}
                </option>
              ))}
            </select>
            <select
              name="priority"
              defaultValue={priorityFilter}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-bi-navy"
            >
              <option value="">All Priority</option>
              <option value="high">High (70-100)</option>
              <option value="mid">Mid (40-69)</option>
              <option value="low">Low (0-39)</option>
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
                <th className="px-6 py-4 font-semibold">Ticket ID</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Priority</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    No complaints found matching your criteria
                  </td>
                </tr>
              ) : (
                complaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-900 text-xs">{complaint.ticketId}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{complaint.account.accountHolder}</p>
                        <p className="text-xs text-gray-500">{complaint.account.accountNumber}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {complaint.category.replace("_", " ")}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getPriorityVariant(complaint.aiPriorityScore)}>
                        {getPriorityLabel(complaint.aiPriorityScore)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusVariant(complaint.status)}>{complaint.status.replace("_", " ")}</Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(complaint.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/complaints/${complaint.id}`}
                        className="text-bi-navy hover:underline text-sm font-medium"
                      >
                        View Case
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
            {totalCount} complaints
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={`/complaints?q=${query}&status=${statusFilter}&category=${categoryFilter}&priority=${priorityFilter}&page=${page - 1}`}
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
              href={`/complaints?q=${query}&status=${statusFilter}&category=${categoryFilter}&priority=${priorityFilter}&page=${page + 1}`}
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
