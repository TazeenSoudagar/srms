"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardList, Clock, CheckCircle, Star, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getAssignedRequests } from "@/lib/api/requests";
import { getSchedules } from "@/lib/api/schedules";
import { Badge } from "@/components/common/Badge";
import { STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, formatDate } from "@/lib/utils";
import type { ServiceRequest, Schedule } from "@/lib/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [upcoming, setUpcoming] = useState<Schedule[]>([]);
  const [closed, setClosed] = useState<ServiceRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingSchedules, setLoadingSchedules] = useState(true);

  useEffect(() => {
    getAssignedRequests({ status: "open,in_progress", per_page: 5 })
      .then((res) => setRequests(res.data.data))
      .catch(() => {})
      .finally(() => setLoadingRequests(false));

    getAssignedRequests({ status: "closed", per_page: 5 })
      .then((res) => setClosed(res.data.data))
      .catch(() => {});

    getSchedules({ status: "pending,confirmed" })
      .then((res) => setUpcoming(res.data.data))
      .catch(() => {})
      .finally(() => setLoadingSchedules(false));
  }, []);

  const stats = [
    {
      label: "Active Requests",
      value: requests.length,
      icon: ClipboardList,
      color: "bg-blue-50 text-blue-700",
      iconColor: "text-blue-600",
    },
    {
      label: "Upcoming Schedules",
      value: upcoming.length,
      icon: Clock,
      color: "bg-amber-50 text-amber-700",
      iconColor: "text-amber-600",
    },
    {
      label: "Completed",
      value: closed.length,
      icon: CheckCircle,
      color: "bg-green-50 text-green-700",
      iconColor: "text-green-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          Good day, {user?.first_name} 👋
        </h1>
        <p className="text-neutral-500 text-sm mt-1">Here&apos;s your work overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color, iconColor }) => (
          <div key={label} className="bg-white rounded-xl border border-neutral-200 p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${color}`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{value}</p>
              <p className="text-sm text-neutral-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Requests */}
        <div className="bg-white rounded-xl border border-neutral-200">
          <div className="flex items-center justify-between p-5 border-b border-neutral-100">
            <h2 className="font-semibold text-neutral-800">Active Requests</h2>
            <Link href="/requests" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-neutral-100">
            {loadingRequests ? (
              <div className="p-5 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-neutral-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="p-8 text-center text-neutral-400">
                <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No active requests</p>
              </div>
            ) : (
              requests.map((req) => (
                <Link
                  key={req.id}
                  href={`/requests/${req.id}`}
                  className="flex items-start gap-3 p-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800 truncate">{req.title}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">#{req.request_number}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge label={STATUS_LABELS[req.status]} className={STATUS_COLORS[req.status]} />
                    <Badge label={req.priority} className={PRIORITY_COLORS[req.priority]} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Schedules */}
        <div className="bg-white rounded-xl border border-neutral-200">
          <div className="flex items-center justify-between p-5 border-b border-neutral-100">
            <h2 className="font-semibold text-neutral-800">Upcoming Schedules</h2>
            <Link href="/schedules" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-neutral-100">
            {loadingSchedules ? (
              <div className="p-5 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-neutral-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : upcoming.length === 0 ? (
              <div className="p-8 text-center text-neutral-400">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No upcoming schedules</p>
              </div>
            ) : (
              upcoming.map((s) => (
                <div key={s.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-800">
                        {s.customer?.first_name} {s.customer?.last_name}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {formatDate(s.scheduled_at)} · {s.estimated_duration_minutes} min
                      </p>
                    </div>
                    <Badge
                      label={s.status}
                      className={s.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Closed requests with ratings */}
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <h2 className="font-semibold text-neutral-800">Recently Closed</h2>
          <Link href="/requests?status=closed" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-neutral-100">
          {closed.length === 0 ? (
            <div className="p-8 text-center text-neutral-400">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No closed requests yet</p>
            </div>
          ) : (
            closed.map((req) => (
              <Link
                key={req.id}
                href={`/requests/${req.id}`}
                className="flex items-center gap-3 p-4 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800 truncate">{req.title}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    #{req.request_number} · Closed {req.closed_at ? formatDate(req.closed_at) : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
