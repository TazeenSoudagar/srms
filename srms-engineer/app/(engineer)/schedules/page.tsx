"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, User } from "lucide-react";
import { getSchedules } from "@/lib/api/schedules";
import { Badge } from "@/components/common/Badge";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Schedule } from "@/lib/types";

const SCHEDULE_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-neutral-100 text-neutral-600",
  cancelled: "bg-red-100 text-red-700",
};

const TABS = [
  { key: "", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
];

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    setLoading(true);
    getSchedules({ status: activeTab || undefined })
      .then((res) => setSchedules(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">My Schedules</h1>
        <p className="text-neutral-500 text-sm mt-1">All your service appointments</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-neutral-100 rounded-lg p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-neutral-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : schedules.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-10 h-10 mx-auto text-neutral-300 mb-3" />
            <p className="text-neutral-500">No schedules found</p>
          </div>
        ) : (
          schedules.map((s) => (
            <div key={s.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm font-medium text-neutral-800">
                      {s.customer?.first_name} {s.customer?.last_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-500 text-sm">
                    <Clock className="w-4 h-4 text-neutral-400" />
                    <span>{formatDate(s.scheduled_at)}</span>
                    <span className="text-neutral-300">·</span>
                    <span>{s.estimated_duration_minutes} min</span>
                  </div>
                  {s.total_amount && (
                    <p className="text-sm text-neutral-600">
                      Total: <span className="font-semibold">₹{Number(s.total_amount).toFixed(2)}</span>
                    </p>
                  )}
                </div>
                <Badge
                  label={s.status.replace("_", " ")}
                  className={SCHEDULE_STATUS_COLORS[s.status] ?? "bg-neutral-100 text-neutral-600"}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
