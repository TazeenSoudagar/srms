import { ClipboardList, UserCheck, CalendarCheck, ThumbsUp, ArrowRight } from "lucide-react";
import Container from "@/components/layout/Container";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How It Works",
  description: "Learn how to book a home service with SRMS in four simple steps.",
};

const steps = [
  {
    icon: ClipboardList,
    step: "01",
    title: "Submit a Request",
    description:
      "Tell us what you need — pick a service category, describe the issue, and choose your preferred date and time. It takes less than 2 minutes.",
  },
  {
    icon: UserCheck,
    step: "02",
    title: "We Assign an Expert",
    description:
      "Our team reviews your request and assigns a verified, trained professional best suited for the job. You'll get notified right away.",
  },
  {
    icon: CalendarCheck,
    step: "03",
    title: "Service is Scheduled",
    description:
      "You'll receive a confirmed schedule with the engineer's details. Track everything in real time from your dashboard.",
  },
  {
    icon: ThumbsUp,
    step: "04",
    title: "Rate & Close",
    description:
      "Once the job is done, mark the request as complete and leave a rating. Your feedback helps us keep quality high.",
  },
];

const faqs = [
  {
    question: "How quickly will my request be assigned?",
    answer:
      "Most requests are assigned within a few hours during business hours (9 AM – 8 PM). For urgent requests, we prioritize assignment.",
  },
  {
    question: "Can I reschedule or cancel?",
    answer:
      "Yes. You can cancel an open request directly from your dashboard. To reschedule, contact our support team and we'll adjust the schedule.",
  },
  {
    question: "How are professionals vetted?",
    answer:
      "All engineers go through background verification, skill assessments, and a trial period before joining the platform.",
  },
  {
    question: "Is there a service guarantee?",
    answer:
      "Yes. If you're not satisfied with the work, raise a complaint within 48 hours and we'll send a technician for a free re-visit.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We accept UPI, net banking, credit/debit cards, and cash on completion. Payments are secure and transparent.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero */}
      <div className="bg-white border-b border-neutral-200 py-14 md:py-20">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              How SRMS Works
            </h1>
            <p className="text-neutral-600 text-lg">
              Book a trusted professional for any home service in four simple steps.
              No calls, no negotiations — just reliable service.
            </p>
          </div>
        </Container>
      </div>

      {/* Steps */}
      <Container>
        <div className="py-14 md:py-20">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.step} className="flex flex-col items-center text-center relative">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-px bg-primary-200 z-0" />
                )}
                <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mb-5 shadow-lg">
                  <s.icon className="w-9 h-9 text-white" />
                </div>
                <span className="text-xs font-bold text-primary-500 tracking-widest mb-1">
                  STEP {s.step}
                </span>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{s.title}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mb-14 md:mb-20 p-8 md:p-12 bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">Ready to get started?</h2>
          <p className="text-primary-100 mb-6 max-w-lg mx-auto">
            Submit your first service request today and experience professional home services the
            modern way.
          </p>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition-colors"
          >
            Book a Service <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* FAQs */}
        <div className="pb-16 md:pb-24">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-neutral-500">Still have questions? We've got answers.</p>
          </div>
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100 overflow-hidden shadow-sm">
            {faqs.map((faq) => (
              <div key={faq.question} className="px-6 py-5">
                <p className="text-sm font-semibold text-neutral-800 mb-1.5">{faq.question}</p>
                <p className="text-sm text-neutral-500 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
