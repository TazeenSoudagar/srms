"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { getNotifications, markAsRead, markAllAsRead, clearAllNotifications } from "@/lib/api/notifications";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Notification } from "@/lib/types";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  useEffect(() => {
    getNotifications()
      .then((res) => setNotifications(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
    } catch {
      // ignore
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
    } catch {
      // ignore
    } finally {
      setMarkingAll(false);
    }
  };

  const handleClearAll = async () => {
    setClearingAll(true);
    try {
      await clearAllNotifications();
      setNotifications([]);
    } catch {
      // ignore
    } finally {
      setClearingAll(false);
    }
  };

  const handleClick = (n: Notification) => {
    handleMarkAsRead(n.id);
    if (n.data.complaint_id) {
      router.push(`/complaints/${n.data.complaint_id}`);
    } else if (n.data.service_request_id) {
      router.push(`/requests/${n.data.service_request_id}`);
    }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Notifications</h1>
          <p className="text-neutral-500 text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors disabled:opacity-50"
            >
              {markingAll ? "Marking..." : "Mark all read"}
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={clearingAll}
              className="text-xs text-neutral-400 hover:text-red-500 font-medium transition-colors disabled:opacity-50"
            >
              {clearingAll ? "Clearing..." : "Clear all"}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-neutral-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center">
            <Bell className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={cn(
                "w-full flex items-start gap-4 p-4 text-left hover:bg-neutral-50 transition-colors",
                !n.read_at && "bg-primary-50 hover:bg-primary-50/80"
              )}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                  n.data.color === "success" && "bg-green-100 text-green-600",
                  n.data.color === "warning" && "bg-amber-100 text-amber-600",
                  n.data.color === "danger" && "bg-red-100 text-red-600",
                  (!n.data.color || n.data.color === "info") && "bg-blue-100 text-blue-600"
                )}
              >
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm", !n.read_at ? "font-semibold text-neutral-900" : "font-medium text-neutral-700")}>
                  {n.data.title}
                </p>
                <p className="text-sm text-neutral-500 mt-0.5 line-clamp-2">{n.data.body}</p>
                <p className="text-xs text-neutral-400 mt-1">{timeAgo(n.created_at)}</p>
              </div>
              {!n.read_at && (
                <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-2" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
