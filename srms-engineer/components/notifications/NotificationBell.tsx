"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { getUnreadCount } from "@/lib/api/notifications";

export function NotificationBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetch = () =>
      getUnreadCount()
        .then((r) => setCount(r.data.count))
        .catch(() => {});

    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Link href="/notifications" className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors">
      <Bell className="w-5 h-5 text-neutral-600" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
