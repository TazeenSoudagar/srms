import Container from "@/components/layout/Container";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "SRMS Privacy Policy — how we collect, use, and protect your data.",
};

const sections = [
  {
    title: "1. Information We Collect",
    body: "We collect information you provide directly — such as your name, email address, phone number, and address when you register or book a service. We also collect information automatically when you use our platform, including device information, IP address, browser type, pages visited, and interaction data. Payment information is collected and processed by our payment gateway partner; SRMS does not store card or bank details.",
  },
  {
    title: "2. How We Use Your Information",
    body: "We use your information to create and manage your account, process and fulfil service bookings, communicate with you about requests, schedules, and updates, send service reminders and promotional communications (you may opt out at any time), improve our platform and personalize your experience, and comply with legal obligations.",
  },
  {
    title: "3. Sharing Your Information",
    body: "We share your information with assigned engineers only to the extent necessary to fulfil your service request (name, address, contact number). We do not sell your personal data to third parties. We may share information with service providers who assist us in operating the platform (payment processors, email services, analytics), all bound by confidentiality agreements. We may disclose information if required by law or to protect the rights and safety of our users.",
  },
  {
    title: "4. Data Retention",
    body: "We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time by contacting us. We may retain certain data for up to 7 years for tax, legal, and audit purposes.",
  },
  {
    title: "5. Cookies and Tracking",
    body: "We use cookies and similar tracking technologies to maintain session state, remember preferences, and analyse platform usage. You can control cookie settings through your browser. Disabling cookies may affect certain platform functionality.",
  },
  {
    title: "6. Security",
    body: "We implement industry-standard security measures including HTTPS encryption, access controls, and regular security audits to protect your data. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.",
  },
  {
    title: "7. Your Rights",
    body: "Under applicable data protection laws, you have the right to access, correct, or delete your personal data; withdraw consent for data processing; request a copy of your data in a portable format; and lodge a complaint with the relevant data protection authority. To exercise these rights, contact us at privacy@srms.com.",
  },
  {
    title: "8. Children's Privacy",
    body: "Our platform is not intended for users under the age of 18. We do not knowingly collect personal information from minors. If we become aware that a minor has registered, we will delete their account and data promptly.",
  },
  {
    title: "9. Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a prominent notice on our platform. Continued use of the platform after changes constitutes acceptance of the updated policy.",
  },
  {
    title: "10. Contact Us",
    body: "For privacy-related questions or requests, contact our Data Protection Officer at privacy@srms.com, or write to: SRMS Technologies Pvt. Ltd., Koramangala, Bangalore, Karnataka – 560034.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-200 py-12 md:py-16">
        <Container>
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3">
              Privacy Policy
            </h1>
            <p className="text-neutral-500 text-sm">Last updated: April 1, 2026</p>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-12 max-w-2xl pb-20 space-y-8">
          <p className="text-sm text-neutral-600 leading-relaxed border-l-4 border-primary-400 pl-4">
            Your privacy matters to us. This policy explains what data we collect, why we collect it, and how we protect it.
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
