"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  FileText,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ChevronRight,
  Star,
} from "lucide-react";
import Container from "@/components/layout/Container";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import { serviceRequestsApi } from "@/lib/api/requests";
import { servicesApi } from "@/lib/api/services";
import { Service } from "@/lib/types/service";
import { formatPrice } from "@/lib/utils/format";

// ─── Form ─────────────────────────────────────────────────────────────────────

interface FormState {
  title: string;
  description: string;
}

interface FormErrors {
  title?: string;
  description?: string;
}

function validate(values: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!values.title.trim()) {
    errors.title = "Title is required";
  } else if (values.title.trim().length < 5) {
    errors.title = "Title must be at least 5 characters";
  }
  if (!values.description.trim()) {
    errors.description = "Description is required";
  } else if (values.description.trim().length < 20) {
    errors.description = "Description must be at least 20 characters";
  }
  return errors;
}

// ─── Inner Component (uses useSearchParams) ───────────────────────────────────

function NewRequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("service");

  const [service, setService] = useState<Service | null>(null);
  const [loadingService, setLoadingService] = useState(!!serviceId);
  const [serviceError, setServiceError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({ title: "", description: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [newRequestId, setNewRequestId] = useState<string | null>(null);

  // Pre-fill title when service loads
  useEffect(() => {
    if (!serviceId) {
      setLoadingService(false);
      return;
    }
    (async () => {
      try {
        setLoadingService(true);
        const res = await servicesApi.getById(serviceId);
        setService(res.data);
        setForm((prev) => ({
          ...prev,
          title: prev.title || `Request for ${res.data.name}`,
        }));
      } catch {
        setServiceError("Could not load service details.");
      } finally {
        setLoadingService(false);
      }
    })();
  }, [serviceId]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const errs = validate({ ...form, [field]: value });
      setErrors((prev) => ({ ...prev, [field]: errs[field] }));
    }
  };

  const handleBlur = (field: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errs = validate(form);
    setErrors((prev) => ({ ...prev, [field]: errs[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched = Object.fromEntries(
      Object.keys(form).map((k) => [k, true])
    );
    setTouched(allTouched);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (!serviceId && !service) {
      setSubmitError("Please select a service first.");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);
      const res = await serviceRequestsApi.create({
        service_id: serviceId || service!.id,
        title: form.title.trim(),
        description: form.description.trim(),
      });
      setNewRequestId(res.data.id);
      setSubmitted(true);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to submit request. Please try again.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success State ──
  if (submitted && newRequestId) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-3">
            Request Submitted!
          </h2>
          <p className="text-neutral-600 mb-8">
            Your service request has been submitted successfully. Our team will
            review it and get back to you shortly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/my-requests/${newRequestId}`}>
              <Button className="w-full sm:w-auto">View Request</Button>
            </Link>
            <Link href="/my-requests">
              <Button variant="outline" className="w-full sm:w-auto">
                All My Requests
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Nav */}
      <div className="bg-white border-b border-neutral-200">
        <Container>
          <div className="flex items-center gap-3 py-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <ChevronRight className="h-4 w-4 text-neutral-300" />
            <Link href="/services" className="text-sm text-neutral-500 hover:text-primary-600">
              Services
            </Link>
            <ChevronRight className="h-4 w-4 text-neutral-300" />
            <span className="text-sm font-medium text-neutral-800">
              New Request
            </span>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-8 md:py-12 max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              Create Service Request
            </h1>
            <p className="text-neutral-600">
              Describe your service needs and our team will get back to you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Form ── */}
            <div className="lg:col-span-2">
              <Card>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Submit Error */}
                  {submitError && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{submitError}</p>
                    </div>
                  )}

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Request Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      onBlur={() => handleBlur("title")}
                      placeholder="e.g. Fix leaking kitchen faucet"
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors ${
                        errors.title && touched.title
                          ? "border-red-300 bg-red-50"
                          : "border-neutral-200 bg-white hover:border-neutral-300"
                      }`}
                    />
                    {errors.title && touched.title && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.title}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) =>
                        handleChange("description", e.target.value)
                      }
                      onBlur={() => handleBlur("description")}
                      placeholder="Describe the issue in detail — what needs to be done, any specific requirements, access instructions, etc."
                      rows={6}
                      className={`w-full px-4 py-3 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors ${
                        errors.description && touched.description
                          ? "border-red-300 bg-red-50"
                          : "border-neutral-200 bg-white hover:border-neutral-300"
                      }`}
                    />
                    <div className="flex items-center justify-between mt-1">
                      {errors.description && touched.description ? (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.description}
                        </p>
                      ) : (
                        <span />
                      )}
                      <span className="text-xs text-neutral-400 ml-auto">
                        {form.description.length} chars
                      </span>
                    </div>
                  </div>

                  {/* No service selected warning */}
                  {!serviceId && !service && (
                    <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                      <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">
                          No service selected
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          You can still submit, but selecting a service helps us
                          assign the right engineer.{" "}
                          <Link
                            href="/services"
                            className="underline hover:text-amber-900"
                          >
                            Browse services
                          </Link>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Submit */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      className="flex-1 sm:flex-none"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="flex-1"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 mr-2" />
                          Submit Request
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>

            {/* ── Sidebar ── */}
            <div className="space-y-4">
              {/* Service Card */}
              {loadingService ? (
                <Card>
                  <div className="p-5 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-primary-400" />
                  </div>
                </Card>
              ) : serviceError ? (
                <Card>
                  <div className="p-5">
                    <p className="text-sm text-red-600">{serviceError}</p>
                  </div>
                </Card>
              ) : service ? (
                <Card variant="elevated">
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="h-4 w-4 text-primary-500" />
                      <h3 className="text-sm font-semibold text-neutral-700">
                        Selected Service
                      </h3>
                    </div>
                    {service.image && (
                      <div className="rounded-xl overflow-hidden mb-3 aspect-[16/9] bg-neutral-100">
                        <img
                          src={service.image}
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <p className="font-semibold text-neutral-900 mb-1">
                      {service.name}
                    </p>
                    {service.description && (
                      <p className="text-xs text-neutral-500 mb-3 line-clamp-2">
                        {service.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      {service.basePrice && (
                        <span className="text-primary-600 font-bold">
                          {formatPrice(service.basePrice)}
                        </span>
                      )}
                      {service.rating && (
                        <div className="flex items-center gap-1 text-xs text-neutral-500">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          {service.rating}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ) : null}

              {/* Help Card */}
              <Card>
                <div className="p-5">
                  <h3 className="text-sm font-semibold text-neutral-700 mb-3">
                    Tips for a great request
                  </h3>
                  <ul className="space-y-2 text-xs text-neutral-600">
                    {[
                      "Be specific about what needs to be done",
                      "Mention any urgency or deadlines",
                      "Include access or location details",
                      "Note any special requirements",
                    ].map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

// ─── Page Export (wrapped in Suspense for useSearchParams) ───────────────────

export default function NewRequestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      }
    >
      <NewRequestForm />
    </Suspense>
  );
}
