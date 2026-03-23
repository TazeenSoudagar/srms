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
} from "lucide-react";
import Container from "@/components/layout/Container";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import { serviceRequestsApi } from "@/lib/api/requests";
import { ServiceRequest } from "@/lib/types/request";
import { formatPrice } from "@/lib/utils/format";

const statusConfig = {
  open: {
    label: "Open",
    icon: Clock,
    color: "bg-blue-100 text-blue-700",
  },
  in_progress: {
    label: "In Progress",
    icon: Clock,
    color: "bg-yellow-100 text-yellow-700",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    color: "bg-green-100 text-green-700",
  },
  cancelled: {
    label: "Cancelled",
    icon: AlertCircle,
    color: "bg-red-100 text-red-700",
  },
};

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const filters = filter !== "all" ? { status: filter } : undefined;
      const response = await serviceRequestsApi.getAll(filters);
      setRequests(response.data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests =
    filter === "all"
      ? requests
      : requests.filter((req) => req.status === filter);

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

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "all"
                  ? "bg-primary-600 text-white"
                  : "bg-white text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              All Requests
            </button>
            <button
              onClick={() => setFilter("open")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "open"
                  ? "bg-primary-600 text-white"
                  : "bg-white text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setFilter("in_progress")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "in_progress"
                  ? "bg-primary-600 text-white"
                  : "bg-white text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "completed"
                  ? "bg-primary-600 text-white"
                  : "bg-white text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              Completed
            </button>
          </div>

          {/* Requests List */}
          {loading ? (
            <div className="py-20 text-center">
              <p className="text-neutral-600">Loading your requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-20 text-center">
              <Package className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="mb-2">No requests found</h3>
              <p className="text-neutral-600 mb-6">
                {filter === "all"
                  ? "You haven't made any service requests yet."
                  : `You don't have any ${filter} requests.`}
              </p>
              <Link href="/services">
                <Button>Browse Services</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => {
                const status = statusConfig[request.status] || statusConfig.open;
                const StatusIcon = status.icon;

                return (
                  <Link
                    key={request.id}
                    href={`/my-requests/${request.id}`}
                    className="block"
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{request.title}</h3>
                              <Badge className={status.color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {status.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-neutral-600 line-clamp-2">
                              {request.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
                          {request.service && (
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              <span>{request.service.name}</span>
                            </div>
                          )}

                          {request.scheduledDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(request.scheduledDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}

                          {request.createdAt && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>
                                Created{" "}
                                {new Date(request.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {request.priority && (
                          <div className="mt-4">
                            <Badge
                              className={
                                request.priority === "high"
                                  ? "bg-red-100 text-red-700"
                                  : request.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-blue-100 text-blue-700"
                              }
                            >
                              {request.priority.charAt(0).toUpperCase() +
                                request.priority.slice(1)}{" "}
                              Priority
                            </Badge>
                          </div>
                        )}
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
