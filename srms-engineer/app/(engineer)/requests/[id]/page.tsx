"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Send,
  PlayCircle,
  CheckCircle2,
  Clock,
  User,
  AlertCircle,
} from "lucide-react";
import {
  getRequest,
  getComments,
  addComment,
  updateStatus,
  requestCompletion,
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
      toast.success("Completion OTP sent to customer. Awaiting their confirmation.");
    } catch {
      toast.error("Failed to request completion.");
    } finally {
      setRequestingCompletion(false);
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

              {canRequestCompletion && (
                <Button
                  className="w-full"
                  loading={requestingCompletion}
                  onClick={handleRequestCompletion}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Request Completion
                </Button>
              )}

              <p className="text-xs text-neutral-400">
                Requesting completion sends an OTP to the customer to confirm the service is done.
              </p>
            </div>
          )}

          {isClosed && (
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
        </div>

        {/* Right: Chat */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 flex flex-col" style={{ height: "560px" }}>
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
                      <span className="text-xs text-neutral-400 px-1">{timeAgo(comment.created_at)}</span>
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
