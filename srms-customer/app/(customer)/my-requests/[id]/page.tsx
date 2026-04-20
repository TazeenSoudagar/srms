"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  Calendar,
  User,
  MessageSquare,
  Paperclip,
  Send,
  Trash2,
  Download,
  FileText,
  ImageIcon,
  Loader2,
  AlertCircle,
  ChevronRight,
  Receipt,
  Star,
} from "lucide-react";
import { getEcho } from "@/lib/echo";
import { toast } from "sonner";
import Container from "@/components/layout/Container";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import { serviceRequestsApi, commentsApi, mediaApi } from "@/lib/api/requests";
import {
  Rating,
  ServiceRequest,
  ServiceRequestStatus,
  Comment,
  Media,
} from "@/lib/types/request";
import RatingModal from "@/components/ratings/RatingModal";
import { useAuth } from "@/contexts/AuthContext";
import { formatRelativeTime } from "@/lib/utils/format";

// ─── Status Config ────────────────────────────────────────────────────────────

const statusConfig: Record<
  ServiceRequestStatus,
  { label: string; icon: React.ElementType; color: string; bgColor: string }
> = {
  open: {
    label: "Open",
    icon: Clock,
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  in_progress: {
    label: "In Progress",
    icon: Clock,
    color: "text-orange-700",
    bgColor: "bg-orange-100",
  },
  closed: {
    label: "Closed",
    icon: CheckCircle2,
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-700",
    bgColor: "bg-red-100",
  },
};

const timelineSteps: { status: ServiceRequestStatus; label: string }[] = [
  { status: "open", label: "Submitted" },
  { status: "in_progress", label: "In Progress" },
  { status: "closed", label: "Closed" },
];

// ─── Timeline Component ───────────────────────────────────────────────────────

function StatusTimeline({ currentStatus }: { currentStatus: ServiceRequestStatus }) {
  const isCancelled = currentStatus === "cancelled";
  const isClosed = currentStatus === "closed";
  const currentIndex = timelineSteps.findIndex((s) => s.status === currentStatus);

  return (
    <div className="relative">
      {isCancelled ? (
        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
          <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-700">Request Cancelled</p>
            <p className="text-sm text-red-600">This service request has been cancelled.</p>
          </div>
        </div>
      ) : isClosed ? (
        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
          <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-700">Request Closed</p>
            <p className="text-sm text-green-600">This service request has been completed and closed.</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
          {timelineSteps.map((step, idx) => {
            const isDone = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const isUpcoming = idx > currentIndex;

            return (
              <div key={step.status} className="flex items-center flex-shrink-0">
                <div className="flex flex-col items-center gap-1.5 px-2">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      isDone
                        ? "bg-primary-600 text-white"
                        : isCurrent
                        ? "bg-primary-100 border-2 border-primary-600 text-primary-600"
                        : "bg-neutral-100 border-2 border-neutral-200 text-neutral-400"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium whitespace-nowrap ${
                      isDone
                        ? "text-primary-700"
                        : isCurrent
                        ? "text-primary-600"
                        : "text-neutral-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < timelineSteps.length - 1 && (
                  <div
                    className={`h-0.5 w-10 md:w-16 flex-shrink-0 ${
                      idx < currentIndex ? "bg-primary-600" : "bg-neutral-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Comment Item ─────────────────────────────────────────────────────────────

function CommentItem({
  comment,
  currentUserId,
  onDelete,
}: {
  comment: Comment;
  currentUserId?: string;
  onDelete: (id: string) => void;
}) {
  const isOwn = comment.user?.id === currentUserId;

  return (
    <div className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
        <User className="h-4 w-4 text-primary-600" />
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-neutral-600">
            {comment.user?.name || "Unknown"}
          </span>
          <span className="text-xs text-neutral-400">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isOwn
              ? "bg-primary-600 text-white rounded-tr-sm"
              : "bg-neutral-100 text-neutral-800 rounded-tl-sm"
          }`}
        >
          {comment.body}
        </div>
        {isOwn && (
          <button
            onClick={() => onDelete(comment.id)}
            className="text-xs text-neutral-400 hover:text-red-500 transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Media Item ───────────────────────────────────────────────────────────────

function MediaItem({
  media,
  onDelete,
  canDelete,
}: {
  media: Media;
  onDelete: (id: string) => void;
  canDelete: boolean;
}) {
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(media.name);

  return (
    <div className="group relative flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-all">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center">
        {isImage ? (
          <ImageIcon className="h-5 w-5 text-blue-500" />
        ) : (
          <FileText className="h-5 w-5 text-neutral-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-800 truncate">
          {media.name}
        </p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <a
          href={media.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg hover:bg-white text-neutral-500 hover:text-primary-600 transition-colors"
          title="Download"
        >
          <Download className="h-4 w-4" />
        </a>
        {canDelete && (
          <button
            onClick={() => onDelete(media.id)}
            className="p-1.5 rounded-lg hover:bg-white text-neutral-500 hover:text-red-500 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Invoice Card ─────────────────────────────────────────────────────────────

type ScheduleItem = NonNullable<ServiceRequest["schedules"]>[number];

function InvoiceCard({
  schedule,
  onDownload,
  downloading,
}: {
  schedule: ScheduleItem;
  onDownload: () => void;
  downloading: boolean;
}) {
  const fmt = (val?: string | null) =>
    val
      ? `₹${parseFloat(val).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : "—";

  return (
    <Card>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="h-4 w-4 text-green-600" />
          <h3 className="text-sm font-semibold text-neutral-700">Invoice</h3>
          {schedule.invoice?.invoice_number && (
            <span className="ml-auto text-xs font-mono text-neutral-400">
              {schedule.invoice.invoice_number}
            </span>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Service Charge</span>
            <span className="font-medium text-neutral-800">{fmt(schedule.actual_price)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">GST ({schedule.gst_rate ?? "18"}%)</span>
            <span className="font-medium text-neutral-800">{fmt(schedule.gst_amount)}</span>
          </div>
          <div className="h-px bg-neutral-100" />
          <div className="flex justify-between text-sm font-semibold">
            <span className="text-neutral-800">Total Amount</span>
            <span className="text-green-700 text-base">{fmt(schedule.total_amount)}</span>
          </div>
        </div>

        {schedule.invoice?.has_pdf && (
          <button
            onClick={onDownload}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {downloading ? "Downloading..." : "Download Invoice (PDF)"}
          </button>
        )}

        {schedule.invoice?.sent_at && (
          <p className="text-center text-xs text-neutral-400 mt-2">
            Emailed on {new Date(schedule.invoice.sent_at).toLocaleDateString()}
          </p>
        )}
      </div>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const requestId = params?.id as string;

  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Comment state
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cancel state
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Invoice download state
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  // Rating modal state
  const [showRatingModal, setShowRatingModal] = useState(false);

  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (requestId) {
      fetchAll();
    }
  }, [requestId]);

  // ── Real-time: reload when a new schedule is broadcast ──────────────────────
  useEffect(() => {
    if (!user?.id) return;

    let mounted = true;
    const channelName = `user.${user.id}`;

    getEcho().then((echo) => {
      if (!echo || !mounted) return;
      const channel = echo.channel(channelName);
      channel.listen('.schedule.created', () => { fetchAll(); });
      channel.listen('.schedule.updated', () => { fetchAll(); });
    });

    return () => {
      mounted = false;
      getEcho().then((echo) => echo?.leaveChannel(channelName));
    };
    // fetchAll is stable for the lifetime of the component mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [reqRes, commentsRes] = await Promise.all([
        serviceRequestsApi.getById(requestId),
        commentsApi.getAll(requestId),
      ]);
      setRequest(reqRes.data);
      setComments(commentsRes.data || []);
      // Load media separately so a failure doesn't block the main view
      mediaApi.getAll(requestId)
        .then((res) => setMedia(res.data || []))
        .catch(() => setMedia([]));
    } catch (err: unknown) {
      console.error("Error fetching request details:", err);
      setError("Failed to load request details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (isRequestClosed) {
      toast.error(`Cannot add comments. Request has been ${request.status}.`);
      return;
    }

    if (!commentText.trim() || submittingComment) return;
    try {
      setSubmittingComment(true);
      const res = await commentsApi.create(requestId, { body: commentText.trim() });
      setComments((prev) => [...prev, res.data]);
      setCommentText("");
      setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentsApi.delete(requestId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  const handleAttachClick = () => {
    if (isRequestClosed) {
      toast.error(`Cannot upload files. Request has been ${request.status}.`);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const res = await mediaApi.upload(requestId, file);
      setMedia((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Error uploading file:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    // Show confirmation dialog
    if (!confirm("Are you sure you want to delete this attachment?")) {
      return;
    }

    try {
      await mediaApi.delete(requestId, mediaId);
      setMedia((prev) => prev.filter((m) => m.id !== mediaId));
      toast.success("Attachment deleted successfully");
    } catch (err: any) {
      console.error("Error deleting media:", err);
      if (err.response?.status === 403) {
        toast.error("Cannot delete attachments. Request is already in progress or closed.");
      } else {
        toast.error(err.response?.data?.message || "Failed to delete attachment");
      }
    }
  };

  const handleCancel = async () => {
    try {
      setCancelling(true);
      const res = await serviceRequestsApi.cancel(requestId, {});
      setRequest(res.data);
      setShowCancelConfirm(false);
    } catch (err) {
      console.error("Error cancelling request:", err);
    } finally {
      setCancelling(false);
    }
  };

  const handleInvoiceDownload = async () => {
    if (!request) return;
    try {
      setDownloadingInvoice(true);
      const blob = await serviceRequestsApi.downloadInvoice(requestId);
      const url = URL.createObjectURL(blob);
      const completedSchedule = request.schedules?.find((s) => s.status === "completed");
      const filename = completedSchedule?.invoice?.invoice_number
        ? `${completedSchedule.invoice.invoice_number}.pdf`
        : `invoice-${request.request_number}.pdf`;
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Invoice downloaded successfully");
    } catch (err) {
      console.error("Error downloading invoice:", err);
      toast.error("Failed to download invoice. Please try again.");
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const handleRatingSuccess = (rating: Rating) => {
    setRequest((prev) => (prev ? { ...prev, rating } : prev));
    setShowRatingModal(false);
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-neutral-600">Loading request details...</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error || !request) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="mb-2">{error || "Request not found"}</h3>
          <p className="text-neutral-600 mb-6">
            We couldn't load this service request. It may have been removed or
            you may not have access.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={fetchAll}>
              Try Again
            </Button>
            <Link href="/my-requests">
              <Button>Back to My Requests</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[request.status] || statusConfig.open;
  const StatusIcon = statusInfo.icon;
  const canCancel = request.status === "open";
  const canDeleteAttachments = request.status === "open";
  const isRequestClosed = request.status === "closed" || request.status === "cancelled";

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Nav */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <Container>
          <div className="flex items-center gap-3 py-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium text-sm hidden sm:block">Back</span>
            </button>
            <ChevronRight className="h-4 w-4 text-neutral-300" />
            <Link href="/my-requests" className="text-sm text-neutral-500 hover:text-primary-600">
              My Requests
            </Link>
            <ChevronRight className="h-4 w-4 text-neutral-300" />
            <span className="text-sm font-medium text-neutral-800 truncate max-w-[200px]">
              {request.title}
            </span>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-6 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Left Column (main content) ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Request Header Card */}
              <Card>
                <div className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      {request.request_number && (
                        <p className="text-xs text-neutral-400 mb-1 font-mono">
                          #{request.request_number}
                        </p>
                      )}
                      <h1 className="text-xl font-bold text-neutral-900">
                        {request.title}
                      </h1>
                    </div>
                    <Badge className={`${statusInfo.bgColor} ${statusInfo.color} flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold`}>
                      <StatusIcon className="h-4 w-4" />
                      {statusInfo.label}
                    </Badge>
                  </div>

                  <p className="text-neutral-700 leading-relaxed mb-5">
                    {request.description}
                  </p>

                  {/* Meta */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-neutral-100">
                    <div>
                      <p className="text-xs text-neutral-400 mb-1">Service</p>
                      <div className="flex items-center gap-1.5">
                        <Package className="h-4 w-4 text-primary-500" />
                        <span className="text-sm font-medium text-neutral-800">
                          {request.service?.name || "—"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 mb-1">Submitted</p>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-primary-500" />
                        <span className="text-sm font-medium text-neutral-800">
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {request.due_date && (
                      <div>
                        <p className="text-xs text-neutral-400 mb-1">Due Date</p>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-accent-500" />
                          <span className="text-sm font-medium text-neutral-800">
                            {new Date(request.due_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}
                    {request.closed_at && (
                      <div>
                        <p className="text-xs text-neutral-400 mb-1">Closed</p>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium text-neutral-800">
                            {new Date(request.closed_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Status Timeline */}
              <Card>
                <div className="p-6">
                  <h2 className="text-base font-semibold text-neutral-800 mb-4">
                    Request Progress
                  </h2>
                  <StatusTimeline currentStatus={request.status} />
                </div>
              </Card>

              {/* ── Rating Section — only for closed requests ── */}
              {request.status === "closed" && (
                <>
                  {request.rating ? (
                    /* Already rated — read-only card */
                    <Card>
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Star className="h-5 w-5 text-amber-400 fill-current" />
                          <h2 className="text-base font-semibold text-neutral-800">
                            Your Rating
                          </h2>
                          <button
                            onClick={() => setShowRatingModal(true)}
                            className="ml-auto text-xs text-neutral-400 hover:text-primary-600 underline transition-colors"
                          >
                            View details
                          </button>
                        </div>

                        {/* Star display */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-6 h-6 ${
                                  star <= request.rating!.rating
                                    ? "text-amber-400 fill-current"
                                    : "text-neutral-300 fill-current"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-semibold text-neutral-700">
                            {request.rating.rating}.0 / 5
                          </span>
                        </div>

                        {request.rating.review && (
                          <p className="text-sm text-neutral-600 leading-relaxed bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                            {request.rating.review}
                          </p>
                        )}

                        {/* Sub-ratings summary */}
                        {(request.rating.professionalism_rating != null ||
                          request.rating.timeliness_rating != null ||
                          request.rating.quality_rating != null) && (
                          <div className="mt-3 pt-3 border-t border-neutral-100 flex flex-wrap gap-3">
                            {request.rating.professionalism_rating != null && (
                              <span className="text-xs text-neutral-500">
                                Professionalism:{" "}
                                <span className="font-semibold text-neutral-700">
                                  {request.rating.professionalism_rating}/5
                                </span>
                              </span>
                            )}
                            {request.rating.timeliness_rating != null && (
                              <span className="text-xs text-neutral-500">
                                Timeliness:{" "}
                                <span className="font-semibold text-neutral-700">
                                  {request.rating.timeliness_rating}/5
                                </span>
                              </span>
                            )}
                            {request.rating.quality_rating != null && (
                              <span className="text-xs text-neutral-500">
                                Quality:{" "}
                                <span className="font-semibold text-neutral-700">
                                  {request.rating.quality_rating}/5
                                </span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  ) : (
                    /* Not yet rated — prompt card */
                    <Card>
                      <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                          <Star className="h-6 w-6 text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-base font-semibold text-neutral-800 mb-0.5">
                            How was your experience?
                          </h2>
                          <p className="text-sm text-neutral-500">
                            Your feedback helps us improve. Rate the service you received.
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowRatingModal(true)}
                          className="flex-shrink-0 border-teal-400 text-teal-600 hover:bg-teal-50"
                        >
                          <Star className="h-4 w-4 mr-1.5" />
                          Leave a Review
                        </Button>
                      </div>
                    </Card>
                  )}

                  {/* Rating Modal */}
                  <RatingModal
                    isOpen={showRatingModal}
                    onClose={() => setShowRatingModal(false)}
                    requestId={requestId}
                    requestTitle={request.title}
                    existingRating={request.rating}
                    onSuccess={handleRatingSuccess}
                  />
                </>
              )}

              {/* Comments Section */}
              <Card>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="h-5 w-5 text-primary-500" />
                    <h2 className="text-base font-semibold text-neutral-800">
                      Comments
                    </h2>
                    {comments.length > 0 && (
                      <span className="ml-auto text-xs text-neutral-400">
                        {comments.length} comment{comments.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4 min-h-[80px] mb-4">
                    {comments.length === 0 ? (
                      <div className="text-center py-8 text-neutral-400">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No comments yet. Start the conversation.</p>
                      </div>
                    ) : (
                      [...comments]
                        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                        .map((comment) => (
                          <CommentItem
                            key={comment.id}
                            comment={comment}
                            currentUserId={user?.id}
                            onDelete={handleDeleteComment}
                          />
                        ))
                    )}
                    <div ref={commentsEndRef} />
                  </div>

                  {/* Comment Input */}
                  <div className="pt-4 border-t border-neutral-100">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAddComment()}
                        placeholder={isRequestClosed ? "Comments are disabled for closed requests" : "Write a comment..."}
                        disabled={isRequestClosed}
                        className={`flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent ${
                          isRequestClosed ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      />
                      <Button
                        onClick={handleAddComment}
                        disabled={isRequestClosed || !commentText.trim() || submittingComment}
                        size="sm"
                        className={`px-4 ${isRequestClosed ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {submittingComment ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {isRequestClosed && (
                      <p className="text-sm text-neutral-500 mt-2">
                        Comments are disabled because this request has been {request.status}.
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Attachments Section */}
              <Card>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Paperclip className="h-5 w-5 text-primary-500" />
                    <h2 className="text-base font-semibold text-neutral-800">
                      Attachments
                    </h2>
                    {media.length > 0 && (
                      <span className="ml-auto text-xs text-neutral-400">
                        {media.length} file{media.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {media.length === 0 ? (
                    <div className="text-center py-6 text-neutral-400">
                      <Paperclip className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No attachments yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 mb-4">
                      {media.map((item) => (
                        <MediaItem
                          key={item.id}
                          media={item}
                          onDelete={handleDeleteMedia}
                          canDelete={canDeleteAttachments}
                        />
                      ))}
                    </div>
                  )}

                  {/* Upload Button */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                  <div>
                    <button
                      onClick={handleAttachClick}
                      disabled={isRequestClosed || uploading}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-neutral-200 text-sm text-neutral-500 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all disabled:opacity-50 ${
                        isRequestClosed ? "cursor-not-allowed" : ""
                      }`}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Paperclip className="h-4 w-4" />
                          Attach a file
                        </>
                      )}
                    </button>
                    {isRequestClosed && (
                      <p className="text-sm text-neutral-500 mt-2">
                        File uploads are disabled because this request has been {request.status}.
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* ── Right Column (sidebar) ── */}
            <div className="space-y-6">

              {/* Service Schedule */}
              <Card>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-4 w-4 text-primary-500" />
                    <h3 className="text-sm font-semibold text-neutral-700">
                      Service Schedule
                    </h3>
                  </div>

                  {request.schedules && request.schedules.length > 0 ? (
                    <div className="space-y-4">
                      {request.schedules.map((schedule, idx) => {
                        const scheduleStatusConfig: Record<
                          string,
                          { label: string; className: string }
                        > = {
                          pending: {
                            label: "Pending",
                            className: "bg-yellow-100 text-yellow-700",
                          },
                          confirmed: {
                            label: "Confirmed",
                            className: "bg-blue-100 text-blue-700",
                          },
                          in_progress: {
                            label: "In Progress",
                            className: "bg-orange-100 text-orange-700",
                          },
                          completed: {
                            label: "Completed",
                            className: "bg-green-100 text-green-700",
                          },
                          cancelled: {
                            label: "Cancelled",
                            className: "bg-red-100 text-red-700",
                          },
                        };
                        const statusInfo = scheduleStatusConfig[schedule.status] ?? {
                          label: schedule.status,
                          className: "bg-neutral-100 text-neutral-600",
                        };

                        return (
                          <div key={schedule.id}>
                            {idx > 0 && (
                              <div className="border-t border-neutral-100 mb-4" />
                            )}
                            {/* Engineer row */}
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                                {schedule.engineer.first_name?.[0]?.toUpperCase() ?? "?"}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-neutral-900 truncate">
                                  {schedule.engineer.first_name}{" "}
                                  {schedule.engineer.last_name}
                                </p>
                                {schedule.engineer.email && (
                                  <p className="text-xs text-neutral-500 truncate">
                                    {schedule.engineer.email}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Date/time row */}
                            <div className="flex items-start gap-2 mb-2">
                              <Clock className="h-3.5 w-3.5 text-neutral-400 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-neutral-600">
                                {new Date(schedule.scheduled_at).toLocaleString()}
                              </p>
                            </div>

                            {/* Status badge */}
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}
                            >
                              {statusInfo.label}
                            </span>

                            {/* Pricing summary — shown when actual_price is set */}
                            {schedule.actual_price != null && (
                              <div className="mt-3 pt-3 border-t border-neutral-100 space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-neutral-500">Service Charge</span>
                                  <span className="text-neutral-700">
                                    ₹{parseFloat(schedule.actual_price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                  </span>
                                </div>
                                {schedule.gst_amount != null && (
                                  <div className="flex justify-between text-xs">
                                    <span className="text-neutral-500">GST ({schedule.gst_rate ?? "18"}%)</span>
                                    <span className="text-neutral-700">
                                      ₹{parseFloat(schedule.gst_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                )}
                                {schedule.total_amount != null && (
                                  <div className="flex justify-between text-xs font-semibold">
                                    <span className="text-neutral-800">Total</span>
                                    <span className="text-green-700">
                                      ₹{parseFloat(schedule.total_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-neutral-400">
                      <Calendar className="h-8 w-8 opacity-40" />
                      <p className="text-sm">Not yet scheduled</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Invoice Card — visible when a completed schedule with pricing exists */}
              {(() => {
                const completedSchedule = request.schedules?.find(
                  (s) => s.status === "completed" && s.actual_price != null
                );
                return completedSchedule ? (
                  <InvoiceCard
                    schedule={completedSchedule}
                    onDownload={handleInvoiceDownload}
                    downloading={downloadingInvoice}
                  />
                ) : null;
              })()}

              {/* Quick Stats */}
              <Card>
                <div className="p-5">
                  <h3 className="text-sm font-semibold text-neutral-700 mb-3">
                    Overview
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500">Status</span>
                      <Badge className={`${statusInfo.bgColor} ${statusInfo.color} text-xs`}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                    {request.priority && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-500">Priority</span>
                        <span className="font-medium capitalize text-neutral-800">
                          {request.priority}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500">Comments</span>
                      <span className="font-medium text-neutral-800">
                        {comments.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500">Attachments</span>
                      <span className="font-medium text-neutral-800">
                        {media.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500">Submitted</span>
                      <span className="font-medium text-neutral-800">
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500">Last Update</span>
                      <span className="font-medium text-neutral-800">
                        {new Date(request.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Actions */}
              {canCancel && (
                <Card>
                  <div className="p-5">
                    <h3 className="text-sm font-semibold text-neutral-700 mb-3">
                      Actions
                    </h3>
                    {!showCancelConfirm ? (
                      <button
                        onClick={() => setShowCancelConfirm(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
                      >
                        <XCircle className="h-4 w-4" />
                        Cancel Request
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-neutral-700">
                          Are you sure you want to cancel this request?
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowCancelConfirm(false)}
                            className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50"
                          >
                            No, keep it
                          </button>
                          <button
                            onClick={handleCancel}
                            disabled={cancelling}
                            className="flex-1 px-3 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-1"
                          >
                            {cancelling ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : null}
                            Yes, cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
