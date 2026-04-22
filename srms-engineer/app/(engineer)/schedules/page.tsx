"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg, EventContentArg } from "@fullcalendar/core";
import { getSchedules } from "@/lib/api/schedules";
import type { Schedule } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  pending: "#ca8a04",
  confirmed: "#16a34a",
  in_progress: "#2563eb",
  completed: "#737373",
  cancelled: "#dc2626",
};

function customerName(s: Schedule): string {
  return s.customer?.name ?? "Customer";
}

function EventContent({ info }: { info: EventContentArg }) {
  return (
    <div className="px-1 py-0.5 overflow-hidden leading-tight">
      <div className="font-semibold text-xs truncate">{info.event.title}</div>
      {info.event.extendedProps.service && (
        <div className="text-[10px] opacity-80 truncate">
          {info.event.extendedProps.service}
        </div>
      )}
    </div>
  );
}

export default function SchedulesPage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSchedules({ page: 1 })
      .then((res) => {
        const meta = res.data.meta;
        const allPages = Array.from({ length: meta.last_page }, (_, i) =>
          i === 0 ? Promise.resolve(res) : getSchedules({ page: i + 1 })
        );
        return Promise.all(allPages);
      })
      .then((pages) => {
        const all = pages.flatMap((p) => p.data.data);
        setSchedules(all);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const events = schedules.map((s) => ({
    id: s.id,
    title: customerName(s),
    start: s.scheduled_at,
    backgroundColor: STATUS_COLORS[s.status] ?? "#737373",
    borderColor: STATUS_COLORS[s.status] ?? "#737373",
    extendedProps: {
      serviceRequestId: s.service_request?.id,
      service: s.service_request?.service?.name,
      status: s.status,
      location: s.location,
    },
  }));

  function handleEventClick(info: EventClickArg) {
    const srId = info.event.extendedProps.serviceRequestId;
    if (srId) router.push(`/requests/${srId}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">My Schedules</h1>
        <p className="text-neutral-500 text-sm mt-1">
          All your service appointments
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-neutral-500 capitalize">
              {status.replace("_", " ")}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        {loading ? (
          <div className="h-[600px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-neutral-400">Loading schedules…</p>
            </div>
          </div>
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={events}
            eventClick={handleEventClick}
            eventContent={(info) => <EventContent info={info} />}
            height={640}
            nowIndicator
            eventDisplay="block"
            dayMaxEvents={3}
            eventTimeFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }}
          />
        )}
      </div>

      <p className="text-xs text-neutral-400 text-center">
        Click any event to view the service request details
      </p>
    </div>
  );
}
