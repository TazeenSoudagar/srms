import { Users, ShieldCheck, Star, Clock, HeartHandshake } from "lucide-react";
import Image from "next/image";

import Container from "@/components/layout/Container";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about SRMS and our mission to deliver professional home services.",
};

const stats = [
  { label: "Happy Customers", value: "12,000+" },
  { label: "Service Requests Completed", value: "45,000+" },
  { label: "Verified Professionals", value: "300+" },
  { label: "Cities Served", value: "8" },
];

const values = [
  {
    icon: ShieldCheck,
    title: "Trust & Safety",
    description:
      "Every professional on our platform is background-verified and trained. Your home, your safety — our responsibility.",
  },
  {
    icon: Star,
    title: "Quality First",
    description:
      "We maintain strict quality standards. Every job is rated, reviewed, and monitored to keep service levels high.",
  },
  {
    icon: Clock,
    title: "On-Time, Every Time",
    description:
      "We respect your time. Our engineers commit to scheduled slots and notify you of any changes in real time.",
  },
  {
    icon: HeartHandshake,
    title: "Customer Obsessed",
    description:
      "From the first booking to the final rating, we're with you every step. Transparent pricing, no surprises.",
  },
];

const team = [
  {
    name: "Arjun Mehta",
    role: "Co-Founder & CEO",
    bio: "10+ years in operations and tech. Passionate about bringing reliability to the home services space.",
  },
  {
    name: "Priya Nair",
    role: "Co-Founder & CTO",
    bio: "Previously at Swiggy and Razorpay. Loves building systems that scale and delight users.",
  },
  {
    name: "Ravi Kumar",
    role: "Head of Operations",
    bio: "Oversees engineer onboarding and service quality across all regions. Former field engineer himself.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 md:py-24">
        <Container>
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            <div className="flex-1">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight text-white">
                Professional Home Services, Delivered with Care
              </h1>
              <p className="text-lg text-primary-100">
                SRMS was founded in 2021 with a simple goal — make home services as easy as ordering
                food online. Today, we serve thousands of happy customers across India.
              </p>
            </div>
            <div className="flex-shrink-0 w-full md:w-80 lg:w-96">
              <Image
                src="/about_us.png"
                alt="About SRMS"
                width={480}
                height={480}
                className="w-full h-auto object-contain drop-shadow-xl"
              />
            </div>
          </div>
        </Container>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-neutral-200">
        <Container>
          <div className="py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-primary-600">{stat.value}</p>
                <p className="text-sm text-neutral-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* Mission */}
      <Container>
        <div className="py-14 md:py-20">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4">Our Mission</h2>
              <p className="text-neutral-600 mb-4 leading-relaxed">
                We believe every homeowner deserves access to skilled, trustworthy professionals
                without the hassle of referrals, negotiations, or uncertainty. SRMS is building the
                infrastructure to make that possible — at scale.
              </p>
              <p className="text-neutral-600 leading-relaxed">
                From plumbing emergencies at midnight to routine AC servicing, our platform connects
                you with the right professional at the right time, every time. We handle scheduling,
                payments, and follow-ups so you don't have to.
              </p>
            </div>
            <div className="flex items-center justify-center">
              <Image
                src="/our_mission.png"
                alt="Our Mission"
                width={400}
                height={400}
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="pb-14 md:pb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2 text-center">
            What We Stand For
          </h2>
          <p className="text-neutral-500 text-center mb-10 text-sm">
            Our values guide every decision we make.
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            {values.map((v) => (
              <div
                key={v.title}
                className="group bg-white rounded-2xl border border-neutral-200 p-6 flex items-start gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                  <v.icon className="w-4.5 h-4.5 text-primary-600" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 text-sm mb-1">{v.title}</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">{v.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="pb-16 md:pb-24">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2 text-center">
            Meet the Team
          </h2>
          <p className="text-neutral-500 text-center mb-10">
            The people behind SRMS.
          </p>
          <div className="grid gap-5 md:grid-cols-3">
            {team.map((member) => (
              <div
                key={member.name}
                className="bg-white rounded-2xl border border-neutral-200 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center mb-3 shadow-sm">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-neutral-900 text-sm">{member.name}</h3>
                <p className="text-xs text-primary-600 font-medium mt-0.5 mb-2">{member.role}</p>
                <p className="text-xs text-neutral-500 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
