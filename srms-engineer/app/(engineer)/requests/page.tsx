"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { getAssignedRequests } from "@/lib/api/requests";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, formatDate } from "@/lib/utils";
import type { ServiceRequest } from "@/lib/types";

const TABS = [
  { key: "", label: "All" },
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In Progress" },
  { key: "closed", label: "Closed" },
  { key: "cancelled", label: "Cancelled" },
];

function RequestsList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get("status") ?? "";
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAssignedRequests({ status: status || undefined, page: 1, per_page: 20 })
      .then((res) => {
        setRequests(res.data.data);
        setMeta(res.data.meta);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">My Requests</h1>
        <p className="text-neutral-500 text-sm mt-1">{meta.total} total requests assigned to you</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-neutral-100 rounded-lg p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => router.push(`/requests${tab.key ? `?status=${tab.key}` : ""}`)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              status === tab.key
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-neutral-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="w-10 h-10 mx-auto text-neutral-300 mb-3" />
            <p className="text-neutral-500">No requests found</p>
          </div>
        ) : (
          requests.map((req) => (
            <Link
              key={req.id}
              href={`/requests/${req.id}`}
              className="flex items-start gap-4 p-4 hover:bg-neutral-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-neutral-800 truncate">{req.title}</p>
                  <span className="text-xs text-neutral-400">#{req.request_number}</span>
                </div>
                <p className="text-sm text-neutral-500 mt-1 line-clamp-1">{req.description}</p>
                <p className="text-xs text-neutral-400 mt-1">
                  Customer: {req.created_by_user?.first_name} {req.created_by_user?.last_name} · {formatDate(req.created_at)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <Badge label={STATUS_LABELS[req.status]} className={STATUS_COLORS[req.status]} />
                <Badge label={req.priority} className={PRIORITY_COLORS[req.priority]} />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default function RequestsPage() {
  return (
    <Suspense>
      <RequestsList />
    </Suspense>
  );
}
