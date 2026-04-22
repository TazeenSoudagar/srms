"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  X,
  ImagePlus,
  Loader2,
  CheckCircle2,
  ChevronRight,
  Hash,
} from "lucide-react";
import Container from "@/components/layout/Container";
import Button from "@/components/common/Button";
import { complaintsApi } from "@/lib/api/complaints";
import { serviceRequestsApi } from "@/lib/api/requests";
import { ServiceRequest } from "@/lib/types/request";
import { toast } from "sonner";

interface ImagePreview {
  file: File;
  previewUrl: string;
}

export default function RaiseComplaintPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<1 | 2>(1);
  const [closedRequests, setClosedRequests] = useState<ServiceRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    serviceRequestsApi
      .getAll({ status: "closed" })
      .then((r) => setClosedRequests(r.data || []))
      .catch(() => toast.error("Failed to load completed requests."))
      .finally(() => setLoadingRequests(false));
  }, []);

  const handleFileAdd = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`"${file.name}" is not an image.`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds 5 MB.`);
        return;
      }
      if (images.length >= 5) {
        toast.error("Maximum 5 images allowed.");
        return;
      }
      setImages((prev) => [...prev, { file, previewUrl: URL.createObjectURL(file) }]);
    });
  };

  const removeImage = (idx: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[idx].previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSubmit = async () => {
    if (!selectedRequest) return;
    if (description.trim().length < 10) {
      toast.error("Please describe the issue (min 10 characters).");
      return;
    }
    if (images.length === 0) {
      toast.error("At least one image is required.");
      return;
    }
    try {
      setSubmitting(true);
      await complaintsApi.create({
        service_request_id: selectedRequest.id,
        description: description.trim(),
        images: images.map((i) => i.file),
      });
      images.forEach((i) => URL.revokeObjectURL(i.previewUrl));
      toast.success("Complaint submitted successfully.");
      router.push("/complaints");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e?.response?.data?.message || "Failed to submit complaint.");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = description.trim().length >= 10 && images.length > 0 && !submitting;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Container>
        <div className="py-6 max-w-xl mx-auto">

          {/* Back */}
          <Link
            href="/complaints"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 mb-5 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Complaints
          </Link>

          {/* Title */}
          <div className="mb-6">
            <p className="text-lg font-semibold text-neutral-900">Raise an Issue</p>
            <p className="text-sm text-neutral-500 mt-0.5">
              Report a problem with a completed service request
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
              step === 1
                ? "bg-neutral-900 text-white"
                : "bg-green-100 text-green-700"
            }`}>
              {step > 1 ? <CheckCircle2 className="h-3 w-3" /> : <span>1</span>}
              Select request
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-neutral-300" />
            <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
              step === 2 ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-400"
            }`}>
              <span>2</span>
              Describe issue
            </div>
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <div>
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg mb-4">
                <AlertTriangle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 leading-relaxed">
                  Complaints can only be raised on <strong>completed</strong> service requests.
                </p>
              </div>

              {loadingRequests ? (
                <div className="py-12 text-center">
                  <Loader2 className="h-5 w-5 animate-spin text-primary-500 mx-auto mb-2" />
                  <p className="text-sm text-neutral-500">Loading your completed requests...</p>
                </div>
              ) : closedRequests.length === 0 ? (
                <div className="py-12 text-center bg-white rounded-xl border border-neutral-200">
                  <p className="text-sm font-medium text-neutral-600 mb-1">
                    No completed requests
                  </p>
                  <p className="text-xs text-neutral-400">
                    You don't have any completed service requests yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {closedRequests.map((req) => (
                    <button
                      key={req.id}
                      onClick={() => { setSelectedRequest(req); setStep(2); }}
                      className="w-full text-left bg-white border border-neutral-200 rounded-xl p-4 hover:border-primary-400 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="flex items-center gap-1 text-xs font-mono text-neutral-400">
                              <Hash className="h-3 w-3" />
                              {req.request_number}
                            </span>
                            <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">
                              Completed
                            </span>
                          </div>
                          <p className="text-sm font-medium text-neutral-800 group-hover:text-primary-700 transition-colors truncate">
                            {req.title}
                          </p>
                          {req.service && (
                            <p className="text-xs text-neutral-400 mt-0.5">{req.service.name}</p>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-primary-500 flex-shrink-0 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && selectedRequest && (
            <div className="space-y-4">

              {/* Selected request pill */}
              <div className="flex items-center justify-between bg-white border border-neutral-200 rounded-lg px-4 py-3">
                <div className="min-w-0">
                  <span className="flex items-center gap-1 text-xs font-mono text-neutral-400 mb-0.5">
                    <Hash className="h-3 w-3" />
                    {selectedRequest.request_number}
                  </span>
                  <p className="text-sm font-medium text-neutral-800 truncate">
                    {selectedRequest.title}
                  </p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium ml-3 flex-shrink-0"
                >
                  Change
                </button>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Describe the issue
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  maxLength={5000}
                  placeholder="What went wrong? Be specific — include what was expected, what happened, and what you'd like resolved."
                  className="w-full px-3.5 py-3 border border-neutral-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-neutral-400 leading-relaxed"
                />
                <div className="flex justify-between mt-1">
                  {description.length > 0 && description.trim().length < 10 ? (
                    <p className="text-xs text-red-500">
                      {10 - description.trim().length} more character{10 - description.trim().length > 1 ? "s" : ""} needed
                    </p>
                  ) : <span />}
                  <p className="text-xs text-neutral-400">{description.length}/5000</p>
                </div>
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Attach images
                  <span className="text-red-500 ml-0.5">*</span>
                  <span className="text-neutral-400 font-normal ml-1 text-xs">(min 1, max 5)</span>
                </label>

                {/* Drop zone */}
                {images.length < 5 && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileAdd(e.dataTransfer.files); }}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      dragOver
                        ? "border-primary-500 bg-primary-50"
                        : "border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50"
                    }`}
                  >
                    <ImagePlus className="h-7 w-7 text-neutral-400 mx-auto mb-2" />
                    <p className="text-sm text-neutral-600">
                      Drop images here or{" "}
                      <span className="text-primary-600 font-medium">browse</span>
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">JPG, PNG, WEBP · max 5 MB each</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileAdd(e.target.files)}
                    />
                  </div>
                )}

                {/* Previews */}
                {images.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mt-3">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100 group ring-1 ring-neutral-200"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.previewUrl}
                          alt={img.file.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {images.length < 5 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-lg border-2 border-dashed border-neutral-300 hover:border-neutral-400 flex items-center justify-center transition-colors"
                      >
                        <ImagePlus className="h-5 w-5 text-neutral-400" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Back
                </button>
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Complaint"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
