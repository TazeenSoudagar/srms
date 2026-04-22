import Container from "@/components/layout/Container";
import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, MessageCircle, Phone, FileText, HelpCircle, Star } from "lucide-react";
import Card from "@/components/common/Card";

export const metadata: Metadata = {
  title: "Help Center",
  description: "Self-serve guides and resources to get the most out of SRMS.",
};

const topics = [
  {
    icon: BookOpen,
    title: "Getting Started",
    description: "New to SRMS? Learn how to create an account, book your first service, and track your request.",
    href: "/how-it-works",
    cta: "Read guide",
  },
  {
    icon: FileText,
    title: "Managing Requests",
    description: "How to view, cancel, or follow up on your service requests from your dashboard.",
    href: "/my-requests",
    cta: "Go to requests",
  },
  {
    icon: Star,
    title: "Ratings & Feedback",
    description: "After a job is completed, you can rate the engineer and leave a review from your request detail page under 'My Requests'.",
    href: "/my-requests?status=closed",
    cta: "Go to requests",
  },
  {
    icon: HelpCircle,
    title: "FAQs",
    description: "Browse answers to the most common questions about bookings, payments, and engineers.",
    href: "/faqs",
    cta: "Browse FAQs",
  },
  {
    icon: MessageCircle,
    title: "Contact Support",
    description: "Can't find what you're looking for? Send us a message and our team will respond within 24 hours.",
    href: "/contact",
    cta: "Contact us",
  },
  {
    icon: Phone,
    title: "Call Us",
    description: "For urgent issues, call our support line directly. Available Mon–Sat, 9 AM to 8 PM.",
    href: "tel:+919876543210",
    cta: "+91 98765 43210",
  },
];

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 py-14 md:py-20">
        <Container>
          <div className="text-center max-w-xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              How can we help you?
            </h1>
            <p className="text-primary-100">
              Browse guides and resources, or reach out to our support team directly.
            </p>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-12 md:py-16 pb-20">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
            {topics.map((topic) => (
              <Link key={topic.title} href={topic.href} className="h-full">
                <Card variant="elevated" padding="lg">
                  <div className="flex flex-col h-full min-h-48">
                    <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center mb-4 shrink-0">
                      <topic.icon className="w-5 h-5 text-primary-600" />
                    </div>
                    <h3 className="text-base font-semibold text-neutral-900 mb-2">{topic.title}</h3>
                    <p className="text-sm text-neutral-500 leading-relaxed flex-1 mb-4">
                      {topic.description}
                    </p>
                    <span className="text-sm text-primary-600 font-medium hover:underline mt-auto">
                      {topic.cta} →
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
