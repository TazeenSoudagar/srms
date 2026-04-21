"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Package,
  Plus,
  XCircle,
  Loader2,
  Star,
} from "lucide-react";
import Container from "@/components/layout/Container";
import Button from "@/components/common/Button";
import RatingModal from "@/components/ratings/RatingModal";
import { serviceRequestsApi } from "@/lib/api/requests";
import { Rating, ServiceRequest, ServiceRequestStatus } from "@/lib/types/request";

const statusConfig: Record<
  ServiceRequestStatus,
  { label: string; icon: React.ElementType; color: string }
> = {
  open: {
    label: "Open",
    icon: Clock,
    color: "bg-blue-100 text-blue-700",
  },
  in_progress: {
    label: "In Progress",
    icon: Clock,
    color: "bg-orange-100 text-orange-700",
  },
  closed: {
    label: "Closed",
    icon: CheckCircle2,
    color: "bg-green-100 text-green-700",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "bg-red-100 text-red-700",
  },
};

const filterTabs = [
  { key: "all", label: "All Requests" },
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In Progress" },
  { key: "closed", label: "Closed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [ratingModalRequestId, setRatingModalRequestId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters =
        filter !== "all"
          ? { status: filter as ServiceRequestStatus }
          : undefined;
      const response = await serviceRequestsApi.getAll(filters);
      setRequests(response.data || []);
    } catch (err: unknown) {
      console.error("Error fetching requests:", err);
      setError("Failed to load your requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSuccess = (requestId: string, rating: Rating) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, rating } : r))
    );
    setRatingModalRequestId(null);
  };

  const priorityConfig = {
    high: "bg-red-100 text-red-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Container>
        <div className="py-6 max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-lg font-semibold text-neutral-900">My Service Requests</p>
              <p className="text-sm text-neutral-500 mt-0.5">
                Track and manage your service requests
              </p>
            </div>
            <Link href="/services">
              <Button size="sm">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                New Request
              </Button>
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1.5 mb-5 bg-white border border-neutral-200 p-1 rounded-lg w-fit flex-wrap">
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
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
              <button onClick={fetchRequests} className="ml-auto text-xs text-red-600 underline">
                Retry
              </button>
            </div>
          )}

          {/* Requests List */}
          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary-500 mx-auto mb-2" />
              <p className="text-sm text-neutral-500">Loading your requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-xl border border-neutral-200">
              <Package className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-neutral-700 mb-1">No requests found</p>
              <p className="text-xs text-neutral-400 mb-4">
                {filter === "all"
                  ? "You haven't made any service requests yet."
                  : `You don't have any ${filter.replace("_", " ")} requests.`}
              </p>
              <Link href="/services">
                <Button size="sm" variant="outline">Browse Services</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {requests.map((request) => {
                const status = statusConfig[request.status] || statusConfig.open;
                const StatusIcon = status.icon;
                const isClosed = request.status === "closed";
                const hasRating = isClosed && request.rating != null;
                const ratingModalOpen = ratingModalRequestId === request.id;

                return (
                  <div key={request.id}>
                    <div className="bg-white border border-neutral-200 rounded-xl hover:border-neutral-300 hover:shadow-sm transition-all">
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <Link href={`/my-requests/${request.id}`} className="flex-1 min-w-0 block">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              {request.request_number && (
                                <span className="text-xs font-mono text-neutral-400">
                                  #{request.request_number}
                                </span>
                              )}
                              <span className={`text-xs font-medium px-1.5 py-0.5 rounded flex items-center gap-1 ${status.color}`}>
                                <StatusIcon className="h-3 w-3" />
                                {status.label}
                              </span>
                              {request.priority && (
                                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${priorityConfig[request.priority] || priorityConfig.low}`}>
                                  {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-neutral-800 hover:text-primary-700 transition-colors truncate">
                              {request.title}
                            </p>
                            <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">
                              {request.description}
                            </p>
                          </Link>

                          {isClosed && (
                            <div className="flex-shrink-0">
                              {hasRating ? (
                                <button
                                  onClick={() => setRatingModalRequestId(request.id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium hover:bg-amber-100 transition-colors"
                                >
                                  <Star className="h-3 w-3 fill-current text-amber-500" />
                                  {request.rating!.rating}/5
                                </button>
                              ) : (
                                <button
                                  onClick={() => setRatingModalRequestId(request.id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-teal-300 text-teal-600 text-xs font-medium hover:bg-teal-50 transition-colors"
                                >
                                  <Star className="h-3 w-3" />
                                  Rate
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        <Link href={`/my-requests/${request.id}`} className="block" tabIndex={-1} aria-hidden="true">
                          <div className="flex flex-wrap items-center gap-3 mt-2.5 pt-2.5 border-t border-neutral-100 text-xs text-neutral-400">
                            {request.service && (
                              <span className="flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                {request.service.name}
                              </span>
                            )}
                            {request.created_at && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(request.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                            )}
                            {request.due_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Due {new Date(request.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                            )}
                            {typeof request.comments_count === "number" && request.comments_count > 0 && (
                              <span>{request.comments_count} comment{request.comments_count !== 1 ? "s" : ""}</span>
                            )}
                          </div>
                        </Link>
                      </div>
                    </div>

                    {isClosed && ratingModalOpen && (
                      <RatingModal
                        isOpen={ratingModalOpen}
                        onClose={() => setRatingModalRequestId(null)}
                        requestId={request.id}
                        requestTitle={request.title}
                        existingRating={request.rating}
                        onSuccess={(rating) => handleRatingSuccess(request.id, rating)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
