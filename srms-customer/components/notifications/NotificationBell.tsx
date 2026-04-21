"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { notificationsApi, Notification } from "@/lib/api/notifications";
import { formatRelativeTime } from "@/lib/utils/format";
import { getEcho } from "@/lib/echo";
import { cn } from "@/lib/utils/cn";

// ─── Broadcast payload shape ──────────────────────────────────────────────────

interface ScheduleCreatedPayload {
  schedule: {
    id: number | string;
    scheduled_at: string;
    status: string;
    customer_name: string;
    engineer_name: string;
  };
  message: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NotificationBell() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);

  // ── Fetch unread count on mount ──────────────────────────────────────────────

  useEffect(() => {
    if (!isAuthenticated) return;

    notificationsApi
      .getUnreadCount()
      .then(({ count }) => setUnreadCount(count))
      .catch(() => {
        // Silently ignore — not critical
      });
  }, [isAuthenticated]);

  // ── Echo listener ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    let mounted = true;
    const channelName = `user.${user.id}`;

    getEcho().then((echo) => {
      if (!echo || !mounted) return;

      const channel = echo.channel(channelName);

      channel.listen(
        '.schedule.created',
        (payload: ScheduleCreatedPayload) => {
          const msg = payload.message ?? 'A new schedule has been created.';
          toast.info(msg, { duration: 6000 });
          setUnreadCount((prev) => prev + 1);
        },
      );

      channel.listen(
        '.schedule.updated',
        (payload: ScheduleCreatedPayload) => {
          const msg = payload.message ?? 'Your schedule has been updated.';
          toast.info(msg, { duration: 6000 });
          setUnreadCount((prev) => prev + 1);
        },
      );
    });

    return () => {
      mounted = false;
      getEcho().then((echo) => echo?.leaveChannel(channelName));
    };
  }, [isAuthenticated, user?.id]);

  // ── Close dropdown when clicking outside ────────────────────────────────────

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  // ── Fetch notification list when panel opens ─────────────────────────────────

  const fetchNotifications = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await notificationsApi.getAll(1);
      setNotifications(res.data ?? []);
    } catch {
      // Silently ignore list fetch failures
    } finally {
      setLoadingList(false);
    }
  }, []);

  const handleToggle = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen) {
      fetchNotifications();
    }
  };

  // ── Mark single notification as read ────────────────────────────────────────

  const handleMarkAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await notificationsApi.markAsRead(id);
    } catch {
      // Revert optimistic update on failure
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: null } : n))
      );
      setUnreadCount((prev) => prev + 1);
    }
  };

  // ── Clear all notifications ──────────────────────────────────────────────────

  const handleClearAll = async () => {
    const previous = notifications;
    const previousCount = unreadCount;
    setNotifications([]);
    setUnreadCount(0);
    try {
      await notificationsApi.clearAll();
    } catch {
      setNotifications(previous);
      setUnreadCount(previousCount);
    }
  };

  // ── Mark all as read ─────────────────────────────────────────────────────────

  const handleMarkAllAsRead = async () => {
    const previousNotifications = notifications;
    const previousCount = unreadCount;

    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() }))
    );
    setUnreadCount(0);

    try {
      await notificationsApi.markAllAsRead();
    } catch {
      // Revert on failure
      setNotifications(previousNotifications);
      setUnreadCount(previousCount);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg text-neutral-600 hover:text-primary-600 hover:bg-primary-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-neutral-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
            <h3 className="text-sm font-semibold text-neutral-900">Notifications</h3>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs text-neutral-400 hover:text-red-500 font-medium transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="max-h-[400px] overflow-y-auto">
            {loadingList ? (
              <div className="flex items-center justify-center py-10 text-neutral-400 text-sm">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-neutral-400">
                <Bell className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <ul role="list">
                {notifications.map((notification) => {
                  const isUnread = notification.read_at === null;
                  return (
                    <li key={notification.id}>
                      <button
                        type="button"
                        onClick={() => {
                          if (isUnread) {
                            handleMarkAsRead(notification.id);
                          }
                          const complaintId = notification.data?.complaint_id as string | undefined;
                          const requestId = notification.data?.service_request_id as string | undefined;
                          setIsOpen(false);
                          if (complaintId) {
                            router.push(`/complaints/${complaintId}`);
                          } else if (requestId) {
                            router.push(`/my-requests/${requestId}`);
                          }
                        }}
                        className={cn(
                          "w-full text-left px-4 py-3 flex items-start gap-3 transition-colors hover:bg-neutral-50",
                          isUnread && "bg-primary-50 hover:bg-primary-100"
                        )}
                      >
                        {/* Unread dot */}
                        <span
                          className={cn(
                            "mt-1.5 flex-shrink-0 w-2 h-2 rounded-full",
                            isUnread ? "bg-primary-600" : "bg-transparent"
                          )}
                          aria-hidden="true"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 truncate">
                            {notification.title}
                          </p>
                          <p className="text-xs text-neutral-600 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-neutral-400 mt-1">
                            {formatRelativeTime(notification.created_at)}
                          </p>
                        </div>
                      </button>
                      <div className="border-b border-neutral-100 last:border-0" />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
