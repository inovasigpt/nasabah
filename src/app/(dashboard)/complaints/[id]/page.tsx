import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle, MessageSquare, FileText, User } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface CaseDetailPageProps {
  params: {
    id: string;
  };
}

function getStatusVariant(status: string) {
  switch (status) {
    case "OPEN": return "warning";
    case "IN_PROGRESS": return "info";
    case "ESCALATED": return "danger";
    case "RESOLVED": return "success";
    case "CLOSED": return "default";
    default: return "default";
  }
}

function getPriorityVariant(score: number) {
  if (score >= 70) return "danger";
  if (score >= 40) return "warning";
  return "success";
}

function getSentimentColor(sentiment: string | null) {
  if (!sentiment) return "text-gray-500";
  if (sentiment === "Negative") return "text-red-600";
  if (sentiment === "Neutral") return "text-orange-600";
  return "text-green-600";
}

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
  const complaint = await prisma.complaint.findUnique({
    where: { id: parseInt(params.id, 10) },
    include: { account: true },
  });

  if (!complaint) {
    notFound();
  }

  // Mock case history
  const caseHistory = [
    {
      id: 1,
      date: complaint.createdAt,
      actor: "System (AI Triage)",
      action: `Automatically assigned priority ${complaint.aiPriorityScore} based on NLP analysis`,
      type: "auto",
    },
    {
      id: 2,
      date: new Date(new Date(complaint.createdAt).getTime() + 1000 * 60 * 30),
      actor: "Fraud Analyst",
      action: "Reviewed initial report and linked to account profile",
      type: "manual",
    },
    ...(complaint.status !== "OPEN"
      ? [
          {
            id: 3,
            date: new Date(new Date(complaint.createdAt).getTime() + 1000 * 60 * 60 * 2),
            actor: "System",
            action: `Status updated to ${complaint.status}`,
            type: "auto",
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/complaints">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Inbox
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Case Detail</h1>
          <p className="text-gray-500 text-sm">{complaint.ticketId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Case Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Complaint Information</h2>
                <p className="text-sm text-gray-500">Submitted on {new Date(complaint.createdAt).toLocaleString()}</p>
              </div>
              <Badge variant={getStatusVariant(complaint.status)} className="text-sm">
                {complaint.status.replace("_", " ")}
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="text-gray-900">{complaint.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Category</p>
                  <p className="font-medium text-gray-900">{complaint.category.replace("_", " ")}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">AI Priority Score</p>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${complaint.aiPriorityScore >= 70 ? "text-red-600" : "text-orange-500"}`} />
                    <span className="font-bold text-gray-900">{complaint.aiPriorityScore}/100</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Sentiment Analysis</p>
                  <p className={`font-medium ${getSentimentColor(complaint.sentiment)}`}>
                    {complaint.sentiment || "Analyzing..."}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Account Risk Score</p>
                  <Badge variant={getPriorityVariant(complaint.account.riskScore)}>
                    {complaint.account.riskScore}/100
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Case History */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Case History</h2>
            <div className="space-y-4">
              {caseHistory.map((event) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      event.type === "auto" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                    }`}>
                      {event.type === "auto" ? <MessageSquare className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    {event.id !== caseHistory.length && <div className="w-px h-full bg-gray-200 mt-2" />}
                  </div>
                  <div className="pb-6">
                    <p className="text-sm font-medium text-gray-900">{event.actor}</p>
                    <p className="text-sm text-gray-600 mt-1">{event.action}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(event.date).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Customer Profile</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Account Holder</p>
                <p className="text-sm font-medium text-gray-900">{complaint.account.accountHolder}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Account Number</p>
                <p className="text-sm font-mono text-gray-900">{complaint.account.accountNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Balance</p>
                <p className="text-sm font-medium text-gray-900">
                  Rp {Number(complaint.account.balance).toLocaleString("id-ID")}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Account Status</p>
                <Badge variant={complaint.account.status === "ACTIVE" ? "success" : complaint.account.status === "FROZEN" ? "danger" : "warning"}>
                  {complaint.account.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Actions</h3>
            <div className="space-y-2">
              <Button className="w-full" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Update Status
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                View Money Trail
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                Link Transaction
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
