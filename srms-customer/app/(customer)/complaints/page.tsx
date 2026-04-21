"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Loader2,
  Plus,
  MessageSquare,
  ChevronRight,
  Hash,
} from "lucide-react";
import Container from "@/components/layout/Container";
import Button from "@/components/common/Button";
import { complaintsApi } from "@/lib/api/complaints";
import { Complaint, ComplaintStatus } from "@/lib/types/complaint";

const statusConfig: Record<
  ComplaintStatus,
  { label: string; icon: React.ElementType; pill: string; dot: string }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    pill: "bg-red-50 text-red-700 ring-1 ring-red-200",
    dot: "bg-red-500",
  },
  in_progress: {
    label: "In Progress",
    icon: MessageSquare,
    pill: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    dot: "bg-amber-500",
  },
  closed: {
    label: "Resolved",
    icon: CheckCircle2,
    pill: "bg-green-50 text-green-700 ring-1 ring-green-200",
    dot: "bg-green-500",
  },
};

const filterTabs: { key: "all" | ComplaintStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "in_progress", label: "In Progress" },
  { key: "closed", label: "Resolved" },
];

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | ComplaintStatus>("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComplaints();
  }, [filter]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await complaintsApi.getAll(
        filter !== "all" ? { status: filter } : undefined
      );
      setComplaints(response.data || []);
    } catch {
      setError("Failed to load complaints.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Container>
        <div className="py-6 max-w-2xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-lg font-semibold text-neutral-900">My Complaints</p>
              <p className="text-sm text-neutral-500 mt-0.5">
                Issues raised on completed service requests
              </p>
            </div>
            <Link href="/complaints/new">
              <Button size="sm">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Raise an Issue
              </Button>
            </Link>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1.5 mb-5 bg-white border border-neutral-200 p-1 rounded-lg w-fit">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filter === tab.key
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
              <button onClick={fetchComplaints} className="ml-auto text-xs text-red-600 underline">
                Retry
              </button>
            </div>
          )}

          {/* List */}
          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary-500 mx-auto mb-3" />
              <p className="text-sm text-neutral-500">Loading...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-xl border border-neutral-200">
              <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="h-5 w-5 text-neutral-400" />
              </div>
              <p className="text-sm font-medium text-neutral-700 mb-1">No complaints yet</p>
              <p className="text-xs text-neutral-400 mb-4 max-w-xs mx-auto">
                {filter === "all"
                  ? "Issues you raise on completed service requests will appear here."
                  : `No ${filter.replace("_", " ")} complaints found.`}
              </p>
              {filter === "all" && (
                <Link href="/complaints/new">
                  <Button size="sm" variant="outline">
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Raise an Issue
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {complaints.map((complaint) => {
                const cfg = statusConfig[complaint.status];
                return (
                  <Link
                    key={complaint.id}
                    href={`/complaints/${complaint.id}`}
                    className="flex items-center gap-3 bg-white rounded-xl border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all p-4 group"
                  >
                    {/* Status dot */}
                    <div className="flex-shrink-0">
                      <span className={`inline-block w-2 h-2 rounded-full ${cfg.dot}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono text-neutral-400">
                          {complaint.complaint_number}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.pill}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-700 line-clamp-1 leading-snug">
                        {complaint.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        {complaint.service_request && (
                          <span className="flex items-center gap-1 text-xs text-neutral-400">
                            <Hash className="h-3 w-3" />
                            {complaint.service_request.request_number}
                          </span>
                        )}
                        <span className="text-xs text-neutral-400">
                          {new Date(complaint.created_at).toLocaleDateString("en-US", {
                            month: "short", day: "numeric",
                          })}
                        </span>
                        {complaint.media && complaint.media.length > 0 && (
                          <span className="text-xs text-neutral-400">
                            {complaint.media.length} image{complaint.media.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-500 flex-shrink-0 transition-colors" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
