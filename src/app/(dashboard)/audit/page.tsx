import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface AuditPageProps {
  searchParams: {
    q?: string;
    action?: string;
    page?: string;
  };
}

const ITEMS_PER_PAGE = 10;

export default async function AuditPage({ searchParams }: AuditPageProps) {
  const query = searchParams.q || "";
  const actionFilter = searchParams.action || "";
  const page = parseInt(searchParams.page || "1", 10);

  const where: any = {
    AND: [
      query
        ? {
            OR: [
              { action: { contains: query, mode: "insensitive" } },
              { entity: { contains: query, mode: "insensitive" } },
              { user: { name: { contains: query, mode: "insensitive" } } },
            ],
          }
        : {},
      actionFilter ? { action: actionFilter } : {},
    ],
  };

  const [logs, totalCount] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      include: { user: true },
    }),
    prisma.auditLog.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
        <p className="text-gray-500 mt-1">Immutable activity logs for compliance and investigation</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <form className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              name="q"
              defaultValue={query}
              placeholder="Search action, entity, or user..."
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              name="action"
              defaultValue={actionFilter}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-bi-navy"
            >
              <option value="">All Actions</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="FREEZE">Freeze</option>
              <option value="UNFREEZE">Unfreeze</option>
              <option value="VIEW">View</option>
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
                <th className="px-6 py-4 font-semibold">Timestamp</th>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Action</th>
                <th className="px-6 py-4 font-semibold">Entity</th>
                <th className="px-6 py-4 font-semibold">Entity ID</th>
                <th className="px-6 py-4 font-semibold">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <ClipboardList className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    No audit logs found matching your criteria
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {log.user?.name || "System"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={log.action === "DELETE" || log.action === "FREEZE" ? "danger" : log.action === "CREATE" ? "success" : "default"}>
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{log.entity}</td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{log.entityId || "-"}</td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{log.ipAddress || "-"}</td>
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
            {totalCount} logs
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={`/audit?q=${query}&action=${actionFilter}&page=${page - 1}`}
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
              href={`/audit?q=${query}&action=${actionFilter}&page=${page + 1}`}
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
