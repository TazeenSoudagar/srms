"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  Clock,
  CheckCircle2,
  MessageSquare,
  User,
  Wrench,
  ZoomIn,
  ExternalLink,
  Loader2,
  FileText,
  Hash,
} from "lucide-react";
import Container from "@/components/layout/Container";
import { complaintsApi } from "@/lib/api/complaints";
import { Complaint, ComplaintStatus } from "@/lib/types/complaint";
import { toast } from "sonner";

const statusConfig: Record<
  ComplaintStatus,
  { label: string; icon: React.ElementType; pill: string; accent: string }
> = {
  pending: {
    label: "Pending Review",
    icon: Clock,
    pill: "bg-red-50 text-red-700 ring-1 ring-red-200",
    accent: "text-red-600",
  },
  in_progress: {
    label: "Being Addressed",
    icon: MessageSquare,
    pill: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    accent: "text-amber-600",
  },
  closed: {
    label: "Resolved",
    icon: CheckCircle2,
    pill: "bg-green-50 text-green-700 ring-1 ring-green-200",
    accent: "text-green-600",
  },
};

const steps = [
  { key: "submitted", label: "Submitted", desc: "Complaint received" },
  { key: "in_progress", label: "Under review", desc: "Engineer assigned" },
  { key: "closed", label: "Resolved", desc: "Complaint closed" },
];

function getStepIndex(status: ComplaintStatus) {
  if (status === "pending") return 0;
  if (status === "in_progress") return 1;
  return 2;
}

export default function ComplaintDetailPage() {
  const params = useParams();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    complaintsApi
      .getById(params.id as string)
      .then((r) => setComplaint(r.data))
      .catch(() => toast.error("Failed to load complaint."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
          <p className="text-sm text-neutral-500 mb-3">Complaint not found</p>
          <Link href="/complaints" className="text-sm text-primary-600 hover:underline">
            Back to complaints
          </Link>
        </div>
      </div>
    );
  }

  const cfg = statusConfig[complaint.status];
  const StatusIcon = cfg.icon;
  const stepIdx = getStepIndex(complaint.status);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Container>
        <div className="py-6 max-w-3xl mx-auto">

          {/* Back */}
          <Link
            href="/complaints"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 mb-5 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Complaints
          </Link>

          {/* Header */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 mb-4 shadow-sm">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  complaint.status === 'pending' ? 'bg-red-50' :
                  complaint.status === 'in_progress' ? 'bg-amber-50' : 'bg-green-50'
                }`}>
                  <StatusIcon className={`h-4 w-4 ${cfg.accent}`} />
                </div>
                <div>
                  <span className="text-sm font-semibold text-neutral-900">
                    {complaint.complaint_number}
                  </span>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {new Date(complaint.created_at).toLocaleDateString("en-US", {
                      month: "long", day: "numeric", year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.pill}`}>
                {cfg.label}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-5 pt-4 border-t border-neutral-100">
              <div className="flex items-center">
                {steps.map((step, idx) => (
                  <div key={step.key} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                        idx <= stepIdx
                          ? "bg-primary-600 border-primary-600"
                          : "bg-white border-neutral-300"
                      }`}>
                        {idx <= stepIdx && (
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <p className={`text-xs mt-1.5 font-medium whitespace-nowrap ${
                        idx <= stepIdx ? "text-neutral-700" : "text-neutral-400"
                      }`}>
                        {step.label}
                      </p>
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={`h-0.5 flex-1 mx-2 mb-4 rounded-full ${
                        idx < stepIdx ? "bg-primary-600" : "bg-neutral-200"
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Left column */}
            <div className="md:col-span-2 space-y-4">

              {/* Description */}
              <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-3.5 w-3.5 text-neutral-400" />
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Issue Description
                  </span>
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">
                  {complaint.description}
                </p>
              </div>

              {/* Images */}
              {complaint.media && complaint.media.length > 0 && (
                <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      Evidence ({complaint.media.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {complaint.media.map((media) => (
                      <button
                        key={media.id}
                        onClick={() => setLightbox(media.url)}
                        className="aspect-square rounded-lg overflow-hidden bg-neutral-100 hover:opacity-80 transition-opacity relative group ring-1 ring-neutral-200"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={media.url}
                          alt={media.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <ZoomIn className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin note */}
              {complaint.admin_note && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                      Note from Admin
                    </span>
                  </div>
                  <p className="text-sm text-amber-900 leading-relaxed">
                    {complaint.admin_note}
                  </p>
                </div>
              )}

              {/* Next steps */}
              {complaint.status !== "closed" && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">
                    What happens next
                  </p>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    {complaint.status === "pending"
                      ? "Our team will review your complaint and assign an engineer. You'll be notified once work begins."
                      : "The engineer is investigating your issue. Once resolved, they'll send you an OTP to confirm closure."}
                  </p>
                </div>
              )}
            </div>

            {/* Right sidebar */}
            <div className="space-y-4">

              {/* Service request */}
              {complaint.service_request && (
                <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                    Service Request
                  </p>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Hash className="h-3 w-3 text-neutral-400" />
                    <span className="text-xs font-mono text-neutral-500">
                      {complaint.service_request.request_number}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-neutral-800 leading-snug mb-2">
                    {complaint.service_request.title}
                  </p>
                  <Link
                    href={`/my-requests/${complaint.service_request.id}`}
                    className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View request
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              )}

              {/* Engineer */}
              <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                  Assigned Engineer
                </p>
                {complaint.assigned_engineer ? (
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0 ring-1 ring-primary-100">
                      <Wrench className="h-3.5 w-3.5 text-primary-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {complaint.assigned_engineer.first_name}{" "}
                        {complaint.assigned_engineer.last_name}
                      </p>
                      <p className="text-xs text-neutral-400 truncate">
                        {complaint.assigned_engineer.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-neutral-400">
                    <User className="h-3.5 w-3.5" />
                    <span className="text-sm">Pending assignment</span>
                  </div>
                )}
              </div>

              {/* Timestamps */}
              <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                  Timeline
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-500">Raised</span>
                    <span className="text-xs font-medium text-neutral-700">
                      {new Date(complaint.created_at).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </span>
                  </div>
                  {complaint.closed_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-neutral-500">Closed</span>
                      <span className="text-xs font-medium text-green-700">
                        {new Date(complaint.closed_at).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-sm transition-colors"
            onClick={() => setLightbox(null)}
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="Evidence"
            className="max-w-full max-h-full rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
