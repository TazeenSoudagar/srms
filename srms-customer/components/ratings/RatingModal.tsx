"use client";

import { useState, useCallback } from "react";
import { X, Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/common/Button";
import { ratingsApi } from "@/lib/api/requests";
import { Rating } from "@/lib/types/request";

// ─── Star Picker ─────────────────────────────────────────────────────────────

interface StarPickerProps {
  value: number;
  onChange: (value: number) => void;
  size?: "sm" | "lg";
  readOnly?: boolean;
}

function StarPicker({ value, onChange, size = "lg", readOnly = false }: StarPickerProps) {
  const [hovered, setHovered] = useState(0);
  const starSize = size === "lg" ? "w-9 h-9" : "w-5 h-5";
  const gap = size === "lg" ? "gap-1.5" : "gap-1";

  return (
    <div
      className={`flex items-center ${gap}`}
      onMouseLeave={() => !readOnly && setHovered(0)}
      role="group"
      aria-label="Star rating"
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const active = (hovered || value) >= star;
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            aria-label={`${star} star${star !== 1 ? "s" : ""}`}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onClick={() => !readOnly && onChange(star)}
            className={`transition-transform focus:outline-none ${
              readOnly ? "cursor-default" : "hover:scale-110 cursor-pointer focus-visible:scale-110"
            }`}
          >
            <Star
              className={`${starSize} transition-colors ${
                active ? "text-amber-400" : "text-neutral-300"
              }`}
              fill="currentColor"
            />
          </button>
        );
      })}
    </div>
  );
}

// ─── Read-only Star Display ───────────────────────────────────────────────────

function StarDisplay({ value, size = "sm" }: { value: number; size?: "sm" | "lg" }) {
  return <StarPicker value={value} onChange={() => {}} size={size} readOnly />;
}

// ─── Sub-Rating Row ───────────────────────────────────────────────────────────

interface SubRatingRowProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  readOnly?: boolean;
}

function SubRatingRow({ label, value, onChange, readOnly = false }: SubRatingRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-neutral-600 w-32 flex-shrink-0">{label}</span>
      <StarPicker value={value} onChange={onChange} size="sm" readOnly={readOnly} />
    </div>
  );
}

// ─── Existing Rating View ─────────────────────────────────────────────────────

function ExistingRatingView({ rating }: { rating: Rating }) {
  const hasSubRatings =
    rating.professionalism_rating != null ||
    rating.timeliness_rating != null ||
    rating.quality_rating != null;

  return (
    <div className="space-y-5">
      {/* Overall */}
      <div className="flex flex-col items-center gap-2 py-4 bg-amber-50 rounded-xl border border-amber-100">
        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
          Your Rating
        </p>
        <StarDisplay value={rating.rating} size="lg" />
        <p className="text-2xl font-bold text-amber-600">{rating.rating}.0 / 5</p>
      </div>

      {/* Sub-ratings */}
      {hasSubRatings && (
        <div className="space-y-3 px-1">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Detailed Ratings
          </p>
          {rating.professionalism_rating != null && (
            <SubRatingRow
              label="Professionalism"
              value={rating.professionalism_rating}
              onChange={() => {}}
              readOnly
            />
          )}
          {rating.timeliness_rating != null && (
            <SubRatingRow
              label="Timeliness"
              value={rating.timeliness_rating}
              onChange={() => {}}
              readOnly
            />
          )}
          {rating.quality_rating != null && (
            <SubRatingRow
              label="Quality"
              value={rating.quality_rating}
              onChange={() => {}}
              readOnly
            />
          )}
        </div>
      )}

      {/* Review text */}
      {rating.review && (
        <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
            Your Review
          </p>
          <p className="text-sm text-neutral-700 leading-relaxed">{rating.review}</p>
        </div>
      )}

      {/* Date */}
      <p className="text-xs text-neutral-400 text-center">
        Submitted on {new Date(rating.created_at).toLocaleDateString()}
      </p>
    </div>
  );
}

// ─── Modal Props ──────────────────────────────────────────────────────────────

export interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  requestTitle: string;
  existingRating?: Rating | null;
  onSuccess: (rating: Rating) => void;
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function RatingModal({
  isOpen,
  onClose,
  requestId,
  requestTitle,
  existingRating,
  onSuccess,
}: RatingModalProps) {
  const [overallRating, setOverallRating] = useState(0);
  const [professionalismRating, setProfessionalismRating] = useState(0);
  const [timelinessRating, setTimelinessRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const MAX_REVIEW_LENGTH = 1000;
  const isReadOnly = existingRating != null;

  const handleSubmit = useCallback(async () => {
    if (overallRating === 0) {
      toast.error("Please select an overall rating before submitting.");
      return;
    }
    try {
      setSubmitting(true);
      const payload: {
        rating: number;
        review?: string;
        professionalism_rating?: number;
        timeliness_rating?: number;
        quality_rating?: number;
      } = { rating: overallRating };

      if (review.trim()) payload.review = review.trim();
      if (professionalismRating > 0) payload.professionalism_rating = professionalismRating;
      if (timelinessRating > 0) payload.timeliness_rating = timelinessRating;
      if (qualityRating > 0) payload.quality_rating = qualityRating;

      const res = await ratingsApi.submit(requestId, payload);
      const saved: Rating = res.data.data;
      toast.success("Your rating has been submitted. Thank you!");
      onSuccess(saved);
      onClose();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const message =
        axiosError?.response?.data?.message ?? "Failed to submit rating. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }, [
    overallRating,
    review,
    professionalismRating,
    timelinessRating,
    qualityRating,
    requestId,
    onSuccess,
    onClose,
  ]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isReadOnly ? "Your submitted rating" : "Rate this service"}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 fade-in duration-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-neutral-900">
              {isReadOnly ? "Your Rating" : "Rate Your Experience"}
            </h2>
            <p className="text-xs text-neutral-500 truncate mt-0.5">{requestTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-3 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          {isReadOnly ? (
            <ExistingRatingView rating={existingRating} />
          ) : (
            <div className="space-y-6">
              {/* Overall rating */}
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm font-medium text-neutral-700">
                  Overall Rating <span className="text-red-500">*</span>
                </p>
                <StarPicker value={overallRating} onChange={setOverallRating} size="lg" />
                {overallRating > 0 && (
                  <p className="text-xs text-neutral-500">
                    {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][overallRating]}
                  </p>
                )}
              </div>

              {/* Sub-ratings */}
              <div className="space-y-3 bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                  Detailed Ratings <span className="font-normal normal-case">(optional)</span>
                </p>
                <SubRatingRow
                  label="Professionalism"
                  value={professionalismRating}
                  onChange={setProfessionalismRating}
                />
                <SubRatingRow
                  label="Timeliness"
                  value={timelinessRating}
                  onChange={setTimelinessRating}
                />
                <SubRatingRow
                  label="Quality"
                  value={qualityRating}
                  onChange={setQualityRating}
                />
              </div>

              {/* Written review */}
              <div className="space-y-1.5">
                <label
                  htmlFor="rating-review"
                  className="block text-sm font-medium text-neutral-700"
                >
                  Written Review{" "}
                  <span className="font-normal text-neutral-400">(optional)</span>
                </label>
                <textarea
                  id="rating-review"
                  value={review}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_REVIEW_LENGTH) {
                      setReview(e.target.value);
                    }
                  }}
                  rows={4}
                  placeholder="Share details about your experience..."
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent resize-none transition"
                />
                <p className="text-right text-xs text-neutral-400">
                  {review.length} / {MAX_REVIEW_LENGTH}
                </p>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        {!isReadOnly && (
          <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={submitting || overallRating === 0}
              isLoading={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Submitting...
                </>
              ) : (
                "Submit Rating"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
