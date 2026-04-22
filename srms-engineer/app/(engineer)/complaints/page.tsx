"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  MessageSquare,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { getComplaints } from "@/lib/api/complaints";
import type { Complaint, ComplaintStatus } from "@/lib/types/complaint";

const STATUS_TABS = [
  { key: "", label: "All" },
  { key: "in_progress", label: "Assigned to Me" },
  { key: "closed", label: "Resolved" },
];

const STATUS_CONFIG: Record<
  ComplaintStatus,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "text-red-600",
    bg: "bg-red-100",
  },
  in_progress: {
    label: "In Progress",
    icon: MessageSquare,
    color: "text-amber-600",
    bg: "bg-amber-100",
  },
  closed: {
    label: "Resolved",
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-100",
  },
};

function ComplaintsList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get("status") ?? "";

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });

  const fetchComplaints = useCallback(
    (pageNum: number) => {
      setLoading(true);
      getComplaints({ status: status || undefined, page: pageNum })
        .then((res) => {
          setComplaints(res.data.data);
          setMeta(res.data.meta);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    },
    [status]
  );

  useEffect(() => {
    setPage(1);
    fetchComplaints(1);
  }, [status, fetchComplaints]);

  const setTab = (key: string) => {
    const params = new URLSearchParams();
    if (key) params.set("status", key);
    router.push(`/complaints?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setTab(tab.key)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              status === tab.key
                ? "bg-primary-600 text-white"
                : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-3" />
          <p className="text-neutral-500 text-sm">Loading complaints...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-neutral-200">
          <AlertTriangle className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500 text-sm">No complaints found.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {complaints.map((complaint) => {
              const cfg = STATUS_CONFIG[complaint.status] ?? STATUS_CONFIG.pending;
              const StatusIcon = cfg.icon;
              return (
                <Link
                  key={complaint.id}
                  href={`/complaints/${complaint.id}`}
                  className="block bg-white rounded-2xl border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all p-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}
                    >
                      <StatusIcon className={`h-4 w-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-xs font-mono text-neutral-400">
                          {complaint.complaint_number}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.color}`}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-neutral-900 line-clamp-1">
                        {complaint.description}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-neutral-500">
                        {complaint.service_request && (
                          <span>SR #{complaint.service_request.request_number}</span>
                        )}
                        {complaint.created_by && (
                          <span>
                            {complaint.created_by.first_name}{" "}
                            {complaint.created_by.last_name}
                          </span>
                        )}
                        <span>
                          {new Date(complaint.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-neutral-400 flex-shrink-0 mt-1" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {meta.last_page > 1 && (
            <div className="flex items-center justify-between pt-2">
              <button
                disabled={page <= 1}
                onClick={() => {
                  const prev = page - 1;
                  setPage(prev);
                  fetchComplaints(prev);
                }}
                className="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg disabled:opacity-40 hover:bg-neutral-100 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-neutral-500">
                {page} / {meta.last_page}
              </span>
              <button
                disabled={page >= meta.last_page}
                onClick={() => {
                  const next = page + 1;
                  setPage(next);
                  fetchComplaints(next);
                }}
                className="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg disabled:opacity-40 hover:bg-neutral-100 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ComplaintsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Complaints</h1>
            <p className="text-sm text-neutral-500">
              Manage complaints assigned to you
            </p>
          </div>
        </div>
        <Suspense fallback={<div className="py-8 text-center text-neutral-500">Loading...</div>}>
          <ComplaintsList />
        </Suspense>
      </div>
    </div>
  );
}
