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
} from "lucide-react";
import Container from "@/components/layout/Container";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import { serviceRequestsApi } from "@/lib/api/requests";
import { ServiceRequest, ServiceRequestStatus } from "@/lib/types/request";

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
};

const filterTabs = [
  { key: "all", label: "All Requests" },
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In Progress" },
  { key: "closed", label: "Closed" },
];

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

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

  const priorityConfig = {
    high: "bg-red-100 text-red-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Container>
        <div className="py-8 md:py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="mb-2">My Service Requests</h1>
              <p className="text-neutral-600">
                Track and manage your service requests
              </p>
            </div>
            <Link href="/services">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  filter === tab.key
                    ? "bg-primary-600 text-white"
                    : "bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={fetchRequests}
                className="ml-auto text-sm text-red-600 underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Requests List */}
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-4" />
              <p className="text-neutral-600">Loading your requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-20 text-center">
              <Package className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="mb-2">No requests found</h3>
              <p className="text-neutral-600 mb-6">
                {filter === "all"
                  ? "You haven't made any service requests yet."
                  : `You don't have any ${filter.replace("_", " ")} requests.`}
              </p>
              <Link href="/services">
                <Button>Browse Services</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => {
                const status =
                  statusConfig[request.status] || statusConfig.open;
                const StatusIcon = status.icon;

                return (
                  <Link
                    key={request.id}
                    href={`/my-requests/${request.id}`}
                    className="block"
                  >
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="font-semibold text-neutral-900 truncate">
                                {request.title}
                              </h3>
                              <Badge className={status.color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {status.label}
                              </Badge>
                              {request.priority && (
                                <Badge
                                  className={
                                    priorityConfig[request.priority] ||
                                    priorityConfig.low
                                  }
                                >
                                  {request.priority.charAt(0).toUpperCase() +
                                    request.priority.slice(1)}{" "}
                                  Priority
                                </Badge>
                              )}
                            </div>
                            {request.request_number && (
                              <p className="text-xs text-neutral-400 mb-1">
                                #{request.request_number}
                              </p>
                            )}
                            <p className="text-sm text-neutral-600 line-clamp-2">
                              {request.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 mt-3 pt-3 border-t border-neutral-100">
                          {request.service && (
                            <div className="flex items-center gap-1.5">
                              <Package className="h-4 w-4" />
                              <span>{request.service.name}</span>
                            </div>
                          )}
                          {request.due_date && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Due{" "}
                                {new Date(
                                  request.due_date
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {request.created_at && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4" />
                              <span>
                                {new Date(
                                  request.created_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {request.assigned_to && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-neutral-400">
                                Assigned to:
                              </span>
                              <span className="font-medium text-neutral-700">
                                {request.assigned_to.first_name}{" "}
                                {request.assigned_to.last_name}
                              </span>
                            </div>
                          )}
                          {typeof request.comments_count === "number" &&
                            request.comments_count > 0 && (
                              <div className="flex items-center gap-1.5">
                                <span>
                                  {request.comments_count}{" "}
                                  {request.comments_count === 1
                                    ? "comment"
                                    : "comments"}
                                </span>
                              </div>
                            )}
                        </div>
                      </div>
                    </Card>
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
