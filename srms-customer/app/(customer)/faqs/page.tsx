import Container from "@/components/layout/Container";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Answers to the most common questions about SRMS home services.",
};

const faqs = [
  {
    section: "Booking & Services",
    items: [
      {
        q: "How do I book a service?",
        a: "Log in to your account, go to 'My Requests', click 'New Request', choose a category and service, describe your issue, and pick a preferred date and time. We'll assign an engineer and confirm your schedule.",
      },
      {
        q: "Can I book a service without creating an account?",
        a: "No. An account is required so we can track your requests, send you updates, and maintain a service history for your home.",
      },
      {
        q: "How far in advance can I book?",
        a: "You can book up to 30 days in advance. For urgent issues, we do our best to assign an engineer the same day or next day.",
      },
      {
        q: "What areas do you currently serve?",
        a: "We currently operate in Bangalore, Chennai, Hyderabad, Mumbai, Pune, Delhi NCR, Kolkata, and Ahmedabad. More cities are being added regularly.",
      },
    ],
  },
  {
    section: "Engineers & Quality",
    items: [
      {
        q: "Are your engineers verified?",
        a: "Yes. All engineers on the SRMS platform go through background verification, skill assessments, and a trial period before being listed. We also monitor their ratings continuously.",
      },
      {
        q: "What if I'm not satisfied with the service?",
        a: "Raise a complaint within 48 hours of job completion. We'll arrange a free re-visit by a technician. If the issue persists, we escalate it to our quality team.",
      },
      {
        q: "Can I request a specific engineer?",
        a: "Currently, assignment is done by our team based on availability and skill match. We plan to add engineer selection in a future update.",
      },
    ],
  },
  {
    section: "Pricing & Payments",
    items: [
      {
        q: "How is pricing determined?",
        a: "Pricing depends on the service type, scope of work, and parts required. You'll receive a transparent estimate before the engineer begins work. No hidden charges.",
      },
      {
        q: "What payment methods are accepted?",
        a: "We accept UPI, net banking, credit and debit cards, and cash on completion. All digital payments are processed securely.",
      },
      {
        q: "Is there a cancellation fee?",
        a: "You can cancel an open request at no charge before it is assigned. After assignment, a nominal cancellation fee may apply depending on how close to the scheduled time you cancel.",
      },
    ],
  },
  {
    section: "Scheduling",
    items: [
      {
        q: "Can I reschedule a booked service?",
        a: "Yes. Contact our support team via the Contact page or call us and we'll adjust the schedule subject to engineer availability.",
      },
      {
        q: "What happens if the engineer doesn't show up?",
        a: "This is rare, but if it happens, contact us immediately. We'll reassign the job and apply a discount to your next service as compensation.",
      },
    ],
  },
];

export default function FAQsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-200 py-12 md:py-16">
        <Container>
          <div className="text-center max-w-xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3">
              Frequently Asked Questions
            </h1>
            <p className="text-neutral-600">
              Can't find your answer here?{" "}
              <Link href="/contact" className="text-primary-600 hover:underline">
                Contact us
              </Link>{" "}
              and we'll get back to you.
            </p>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-12 md:py-16 max-w-3xl mx-auto space-y-12 pb-20">
          {faqs.map((section) => (
            <div key={section.section}>
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                {section.section}
              </h2>
              <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100 overflow-hidden shadow-sm">
                {section.items.map((item) => (
                  <div key={item.q} className="px-6 py-5">
                    <p className="text-sm font-semibold text-neutral-800 mb-1.5">{item.q}</p>
                    <p className="text-sm text-neutral-500 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
