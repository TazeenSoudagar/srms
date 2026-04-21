"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ClipboardList, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { getAssignedRequests } from "@/lib/api/requests";
import { Badge } from "@/components/common/Badge";
import { STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, formatDate } from "@/lib/utils";
import type { ServiceRequest } from "@/lib/types";

const TABS = [
  { key: "", label: "All" },
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In Progress" },
  { key: "closed", label: "Closed" },
  { key: "cancelled", label: "Cancelled" },
];

const PER_PAGE = 10;

function RequestsList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get("status") ?? "";

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchRequests = useCallback((searchValue: string, pageNum: number) => {
    setLoading(true);
    getAssignedRequests({
      status: status || undefined,
      page: pageNum,
      per_page: PER_PAGE,
      search: searchValue || undefined,
      sort_by: status ? "created_at" : undefined,
      sort_order: "desc",
    })
      .then((res) => {
        setRequests(res.data.data);
        setMeta(res.data.meta);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

  // Reset page + search when tab changes
  useEffect(() => {
    setSearch("");
    setPage(1);
    fetchRequests("", 1);
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch when page changes (but not on tab change — handled above)
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) { isFirstMount.current = false; return; }
    fetchRequests(search, page);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchRequests(value, 1), 400);
  };

  const goTo = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pageNumbers = (): (number | "…")[] => {
    const total = meta.last_page;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const cur = meta.current_page;
    const pages: (number | "…")[] = [1];
    if (cur > 3) pages.push("…");
    for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i);
    if (cur < total - 2) pages.push("…");
    pages.push(total);
    return pages;
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">My Requests</h1>
        <p className="text-neutral-500 text-sm mt-1">{meta.total} total requests assigned to you</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search by title, request ID or service name…"
          className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {search && (
          <button
            onClick={() => handleSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
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
            {[...Array(PER_PAGE)].map((_, i) => (
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

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="flex items-center justify-between py-2">
          <p className="text-xs text-neutral-500">
            Page {meta.current_page} of {meta.last_page} · {meta.total} requests
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goTo(meta.current_page - 1)}
              disabled={meta.current_page === 1 || loading}
              className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {pageNumbers().map((p, i) =>
              p === "…" ? (
                <span key={`ellipsis-${i}`} className="px-1 text-neutral-400 text-sm">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => goTo(p as number)}
                  disabled={loading}
                  className={`min-w-[32px] h-8 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                    p === meta.current_page
                      ? "bg-primary-600 text-white"
                      : "border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => goTo(meta.current_page + 1)}
              disabled={meta.current_page === meta.last_page || loading}
              className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
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
