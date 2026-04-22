"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Send,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  AlertCircle,
  Star,
} from "lucide-react";
import {
  getRequest,
  getComments,
  addComment,
  updateStatus,
  requestCompletion,
  verifyCompletion,
} from "@/lib/api/requests";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, formatDate, timeAgo } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import type { ServiceRequest, Comment } from "@/lib/types";

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingRequest, setLoadingRequest] = useState(true);
  const [sendingComment, setSendingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [requestingCompletion, setRequestingCompletion] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      getRequest(id).then((r) => setRequest(r.data.data)),
      getComments(id).then((r) => setComments(r.data.data)),
    ])
      .catch(() => toast.error("Failed to load request."))
      .finally(() => setLoadingRequest(false));
  }, [id]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  // Poll comments every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      getComments(id)
        .then((r) => setComments(r.data.data))
        .catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    setSendingComment(true);
    try {
      const res = await addComment(id, newComment.trim());
      setComments((prev) => [res.data.data, ...prev]);
      setNewComment("");
    } catch {
      toast.error("Failed to send message.");
    } finally {
      setSendingComment(false);
    }
  };

  const handleMarkInProgress = async () => {
    setUpdatingStatus(true);
    try {
      const res = await updateStatus(id, "in_progress");
      setRequest(res.data.data);
      toast.success("Request marked as in progress.");
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleRequestCompletion = async () => {
    setRequestingCompletion(true);
    try {
      await requestCompletion(id);
      setOtpSent(true);
      setOtp("");
      toast.success("OTP sent to customer's email. Ask them for the code.");
    } catch {
      toast.error("Failed to send OTP.");
    } finally {
      setRequestingCompletion(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;
    setVerifyingOtp(true);
    try {
      await verifyCompletion(id, otp);
      toast.success("Service completed and request closed.");
      const res = await getRequest(id);
      setRequest(res.data.data);
      setOtpSent(false);
      setOtp("");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Invalid or expired OTP.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  if (loadingRequest) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-neutral-200 rounded w-1/3" />
        <div className="h-48 bg-neutral-200 rounded-xl" />
        <div className="h-96 bg-neutral-200 rounded-xl" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
        <p className="text-neutral-500">Request not found.</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  const status = request.status as string;
  const canMarkInProgress = status === "open";
  const canRequestCompletion = status === "open" || status === "in_progress";
  const isClosed = status === "closed" || status === "cancelled";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-neutral-900 truncate">{request.title}</h1>
          <p className="text-sm text-neutral-500">#{request.request_number}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge label={STATUS_LABELS[request.status]} className={STATUS_COLORS[request.status]} />
          <Badge label={request.priority} className={PRIORITY_COLORS[request.priority]} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: details + actions */}
        <div className="lg:col-span-1 space-y-4">
          {/* Request info */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
            <h2 className="font-semibold text-neutral-800">Request Details</h2>
            <p className="text-sm text-neutral-600 leading-relaxed">{request.description}</p>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-neutral-600">
                <User className="w-4 h-4 text-neutral-400" />
                <span>
                  {request.created_by_user?.first_name} {request.created_by_user?.last_name}
                </span>
              </div>
              {request.schedules?.[0] && (
                <div className="flex items-center gap-2 text-neutral-600">
                  <Clock className="w-4 h-4 text-neutral-400" />
                  <span>{formatDate(request.schedules[0].scheduled_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {!isClosed && (
            <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-3">
              <h2 className="font-semibold text-neutral-800">Actions</h2>

              {canMarkInProgress && (
                <Button
                  variant="secondary"
                  className="w-full"
                  loading={updatingStatus}
                  onClick={handleMarkInProgress}
                >
                  <PlayCircle className="w-4 h-4" />
                  Mark as In Progress
                </Button>
              )}

              {canRequestCompletion && !otpSent && (
                <Button
                  className="w-full"
                  loading={requestingCompletion}
                  onClick={handleRequestCompletion}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Request Completion
                </Button>
              )}

              {otpSent && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-neutral-700">
                    OTP sent to customer's email. Ask them for the code and enter it below.
                  </p>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm tracking-widest text-center font-semibold"
                  />
                  <Button
                    className="w-full"
                    loading={verifyingOtp}
                    disabled={otp.length !== 6}
                    onClick={handleVerifyOtp}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Verify & Close Request
                  </Button>
                  <button
                    onClick={handleRequestCompletion}
                    disabled={requestingCompletion}
                    className="w-full text-xs text-primary-600 hover:underline disabled:opacity-50"
                  >
                    {requestingCompletion ? "Resending…" : "Resend OTP"}
                  </button>
                </div>
              )}

              {!otpSent && (
                <p className="text-xs text-neutral-400">
                  OTP is sent to the customer's email — ask them for the code to close this request.
                </p>
              )}
            </div>
          )}

          {isClosed && (
            <>
              {status === "cancelled" ? (
                <div className="bg-red-50 rounded-xl border border-red-200 p-5 flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-700">Request Cancelled</p>
                    {request.closed_at && (
                      <p className="text-xs text-red-500 mt-0.5">{formatDate(request.closed_at)}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 rounded-xl border border-green-200 p-5 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Service Completed</p>
                    {request.closed_at && (
                      <p className="text-xs text-green-600 mt-0.5">{formatDate(request.closed_at)}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Customer Rating */}
              {request.rating ? (
                <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400 fill-current" />
                    <h2 className="font-semibold text-neutral-800 text-sm">Customer Rating</h2>
                    <span className="ml-auto text-xs text-neutral-400">
                      {request.rating.is_anonymous ? "Anonymous" : request.rating.reviewer.name}
                    </span>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${star <= request.rating!.rating ? "text-amber-400 fill-current" : "text-neutral-200 fill-current"}`}
                      />
                    ))}
                    <span className="text-sm font-semibold text-neutral-700 ml-1">
                      {request.rating.rating}/5
                    </span>
                  </div>

                  {/* Sub-ratings */}
                  {(request.rating.professionalism_rating != null ||
                    request.rating.timeliness_rating != null ||
                    request.rating.quality_rating != null) && (
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Professionalism", value: request.rating.professionalism_rating },
                        { label: "Timeliness", value: request.rating.timeliness_rating },
                        { label: "Quality", value: request.rating.quality_rating },
                      ].map(({ label, value }) =>
                        value == null ? null : (
                          <div key={label} className="bg-neutral-50 rounded-lg p-2 text-center">
                            <p className="text-xs text-neutral-500">{label}</p>
                            <p className="text-sm font-semibold text-neutral-800">{value}/5</p>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {/* Review text */}
                  {request.rating.review && (
                    <p className="text-sm text-neutral-600 leading-relaxed bg-neutral-50 rounded-lg p-3 border border-neutral-100 italic">
                      &ldquo;{request.rating.review}&rdquo;
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-neutral-200 p-5 flex items-center gap-3 text-neutral-400">
                  <Star className="w-4 h-4" />
                  <p className="text-sm">No rating submitted yet</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: Chat */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 flex flex-col min-h-[400px] lg:h-[560px]">
          <div className="p-4 border-b border-neutral-100 flex items-center gap-2">
            <Send className="w-4 h-4 text-primary-600" />
            <h2 className="font-semibold text-neutral-800">Customer Chat</h2>
            <span className="text-xs text-neutral-400 ml-1">({comments.length} messages)</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {comments.length === 0 ? (
              <div className="h-full flex items-center justify-center text-neutral-400 flex-col gap-2">
                <Send className="w-8 h-8 opacity-30" />
                <p className="text-sm">No messages yet. Start the conversation.</p>
              </div>
            ) : (
              [...comments].reverse().map((comment) => {
                const isMe = comment.user?.id === user?.id;
                return (
                  <div key={comment.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    {!isMe && (
                      <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-semibold text-neutral-600 mr-2 flex-shrink-0 mt-1">
                        {comment.user?.first_name?.[0]}
                      </div>
                    )}
                    <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                      {!isMe && (
                        <span className="text-xs text-neutral-500 ml-1">
                          {comment.user?.first_name} {comment.user?.last_name}
                          <span className="text-neutral-400"> · {comment.user?.role?.name}</span>
                        </span>
                      )}
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm ${
                          isMe
                            ? "bg-primary-600 text-white rounded-br-sm"
                            : "bg-neutral-100 text-neutral-800 rounded-bl-sm"
                        }`}
                      >
                        {comment.body}
                      </div>
                      {comment.created_at && <span className="text-xs text-neutral-400 px-1">{timeAgo(comment.created_at)}</span>}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={commentsEndRef} />
          </div>

          {/* Input */}
          {!isClosed && (
            <div className="p-4 border-t border-neutral-100">
              <div className="flex gap-2">
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendComment();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
                <Button
                  onClick={handleSendComment}
                  loading={sendingComment}
                  disabled={!newComment.trim()}
                  size="md"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-neutral-400 mt-1.5">Press Enter to send</p>
            </div>
          )}

          {isClosed && (
            <div className="p-4 border-t border-neutral-100 text-center text-sm text-neutral-400">
              This request is closed. Chat is read-only.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
