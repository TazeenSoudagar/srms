"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Key,
  Loader2,
  ImageIcon,
  ExternalLink,
  User,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { getComplaint, requestResolution, verifyResolution } from "@/lib/api/complaints";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import type { Complaint, ComplaintStatus } from "@/lib/types/complaint";

const STATUS_CONFIG: Record<
  ComplaintStatus,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "text-red-600",
    bg: "bg-red-100",
  },
  in_progress: {
    label: "In Progress",
    icon: MessageSquare,
    color: "text-amber-600",
    bg: "bg-amber-100",
  },
  closed: {
    label: "Resolved",
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-100",
  },
};

export default function ComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    getComplaint(id)
      .then((res) => setComplaint(res.data.data))
      .catch(() => toast.error("Failed to load complaint."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRequestResolution = async () => {
    setSendingOtp(true);
    try {
      await requestResolution(id);
      setOtpSent(true);
      toast.success("OTP sent to customer's email and in-app notification. Ask them for the code.");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Failed to send OTP.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyResolution = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit OTP.");
      return;
    }
    setVerifyingOtp(true);
    try {
      const res = await verifyResolution(id, otp);
      setComplaint(res.data.data);
      toast.success("Complaint resolved and closed successfully!");
      setOtpSent(false);
      setOtp("");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-neutral-500 text-sm">Loading complaint...</p>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
          <p className="text-neutral-600 mb-4">Complaint not found.</p>
          <Link href="/complaints" className="text-primary-600 hover:underline text-sm">
            Back to complaints
          </Link>
        </div>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[complaint.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;
  const isClosed = complaint.status === "closed";
  const isInProgress = complaint.status === "in_progress";

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back */}
        <Link
          href="/complaints"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Complaints
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 mb-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}
            >
              <StatusIcon className={`h-5 w-5 ${cfg.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-bold text-neutral-900 text-sm font-mono">
                  {complaint.complaint_number}
                </span>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.bg} ${cfg.color}`}
                >
                  {cfg.label}
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Raised{" "}
                {new Date(complaint.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
                {complaint.closed_at &&
                  ` · Closed ${new Date(complaint.closed_at).toLocaleDateString()}`}
              </p>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="space-y-4">
          {/* Customer info */}
          {complaint.created_by && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-5">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                Customer
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-neutral-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {complaint.created_by.first_name} {complaint.created_by.last_name}
                  </p>
                  <p className="text-xs text-neutral-500">{complaint.created_by.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Related SR */}
          {complaint.service_request && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-5">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                Related Service Request
              </h3>
              <p className="text-xs font-mono text-neutral-400 mb-0.5">
                #{complaint.service_request.request_number}
              </p>
              <p className="text-sm font-medium text-neutral-900">
                {complaint.service_request.title}
              </p>
              <Link
                href={`/requests/${complaint.service_request.id}`}
                className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline mt-2"
              >
                View Service Request
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          )}

          {/* Issue description */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
              Issue Description
            </h3>
            <p className="text-sm text-neutral-800 leading-relaxed whitespace-pre-wrap">
              {complaint.description}
            </p>
          </div>

          {/* Attached images */}
          {complaint.media && complaint.media.length > 0 && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-5">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <ImageIcon className="h-3.5 w-3.5" />
                Evidence Images ({complaint.media.length})
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {complaint.media.map((media) => (
                  <button
                    key={media.id}
                    onClick={() => setLightboxUrl(media.url)}
                    className="aspect-square rounded-xl overflow-hidden bg-neutral-100 hover:ring-2 hover:ring-primary-500 transition-all relative group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={media.url}
                      alt={media.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <ExternalLink className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Admin note */}
          {complaint.admin_note && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <h3 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">
                Admin Note
              </h3>
              <p className="text-sm text-amber-900 leading-relaxed">
                {complaint.admin_note}
              </p>
            </div>
          )}

          {/* Resolution panel — only for in_progress complaints */}
          {isInProgress && (
            <div className="bg-white rounded-2xl border-2 border-primary-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="h-5 w-5 text-primary-600" />
                <h3 className="font-semibold text-neutral-900">
                  Resolve Complaint
                </h3>
              </div>

              {!otpSent ? (
                <div>
                  <p className="text-sm text-neutral-600 mb-4 leading-relaxed">
                    Once you've resolved the customer's issue, request an OTP.
                    The OTP will be sent to the customer via email and in-app
                    notification. Ask them for the code and enter it below to
                    close this complaint.
                  </p>
                  <Button
                    onClick={handleRequestResolution}
                    disabled={sendingOtp}
                    className="w-full"
                  >
                    {sendingOtp ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4 mr-2" />
                        Send Resolution OTP to Customer
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl mb-4 text-sm text-green-800">
                    OTP has been sent to the customer's email and in-app. Ask
                    them to share the 6-digit code.
                  </div>

                  {/* OTP input */}
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Enter OTP from Customer
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="6-digit OTP"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-center text-base font-mono tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4"
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setOtpSent(false);
                        setOtp("");
                      }}
                      className="flex-1 px-4 py-2.5 border border-neutral-300 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Resend OTP
                    </button>
                    <Button
                      onClick={handleVerifyResolution}
                      disabled={verifyingOtp || otp.length !== 6}
                      className="flex-1"
                    >
                      {verifyingOtp ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Verify & Close
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Closed state */}
          {isClosed && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
              <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-3" />
              <p className="font-semibold text-green-800 mb-1">
                Complaint Resolved
              </p>
              <p className="text-sm text-green-700">
                This complaint was closed on{" "}
                {complaint.closed_at
                  ? new Date(complaint.closed_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            onClick={() => setLightboxUrl(null)}
            aria-label="Close"
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxUrl}
            alt="Evidence image"
            className="max-w-full max-h-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
