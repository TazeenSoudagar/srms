import Container from "@/components/layout/Container";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "SRMS Terms of Service — please read before using our platform.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing or using the SRMS platform (website or mobile application), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. We reserve the right to update these terms at any time, and continued use of the platform constitutes acceptance of any changes.",
  },
  {
    title: "2. Services Provided",
    body: "SRMS acts as an intermediary platform connecting customers with independent, verified home service professionals. We do not directly employ the engineers listed on our platform. SRMS facilitates bookings, scheduling, payments, and dispute resolution, but the service itself is performed by the assigned professional.",
  },
  {
    title: "3. User Accounts",
    body: "You must create an account to book services. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You must provide accurate and complete information during registration. Accounts found to be fraudulent or in violation of these terms may be suspended or permanently deleted.",
  },
  {
    title: "4. Booking and Cancellation",
    body: "Service bookings are confirmed once an engineer is assigned. You may cancel a booking at no charge before assignment. Post-assignment cancellations may incur a nominal fee. SRMS reserves the right to cancel or reschedule bookings in cases of engineer unavailability, extreme weather, or other unforeseen circumstances, with notice provided to the customer.",
  },
  {
    title: "5. Payments",
    body: "All payments are processed through our secure payment gateway. Pricing displayed on the platform is indicative; final pricing is confirmed before the engineer begins work. SRMS does not store card details. In case of payment disputes, contact our support team within 7 days of the transaction.",
  },
  {
    title: "6. Limitation of Liability",
    body: "SRMS shall not be liable for any indirect, incidental, or consequential damages arising from the use of our platform or the services rendered by assigned professionals. Our total liability in any dispute shall not exceed the amount paid for the specific service in question. We strongly recommend that you report issues within 48 hours of service completion.",
  },
  {
    title: "7. Prohibited Conduct",
    body: "Users may not use the platform for any unlawful purpose, attempt to circumvent the platform by directly contracting engineers outside SRMS, post false reviews or fraudulent service requests, or attempt to access other users' data. Violations may result in immediate account termination.",
  },
  {
    title: "8. Intellectual Property",
    body: "All content on the SRMS platform — including logos, text, images, and software — is the property of SRMS Technologies Pvt. Ltd. and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written consent.",
  },
  {
    title: "9. Governing Law",
    body: "These Terms of Service are governed by the laws of India. Any disputes arising from or related to these terms shall be subject to the exclusive jurisdiction of the courts of Bangalore, Karnataka.",
  },
  {
    title: "10. Contact",
    body: "For questions about these Terms, please contact us at legal@srms.com or write to: SRMS Technologies Pvt. Ltd., Koramangala, Bangalore, Karnataka – 560034.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-200 py-12 md:py-16">
        <Container>
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3">
              Terms of Service
            </h1>
            <p className="text-neutral-500 text-sm">Last updated: April 1, 2026</p>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-12 max-w-2xl pb-20 space-y-8">
          <p className="text-sm text-neutral-600 leading-relaxed border-l-4 border-primary-400 pl-4">
            Please read these Terms of Service carefully before using the SRMS platform. These terms govern your use of our website and services.
          </p>
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-base font-semibold text-neutral-900 mb-2">{s.title}</h2>
              <p className="text-sm text-neutral-600 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
