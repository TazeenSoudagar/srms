import { Search, CalendarCheck, CheckCircle2 } from "lucide-react";
import Container from "@/components/layout/Container";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Browse Services",
      description:
        "Explore our wide range of professional home services and find exactly what you need.",
      icon: Search,
      color: "from-primary-500 to-primary-600",
    },
    {
      number: "02",
      title: "Book Your Service",
      description:
        "Choose your preferred date and time, provide details, and submit your request instantly.",
      icon: CalendarCheck,
      color: "from-accent-500 to-accent-600",
    },
    {
      number: "03",
      title: "Get It Done",
      description:
        "Our verified professionals will complete your service with quality and care guaranteed.",
      icon: CheckCircle2,
      color: "from-green-500 to-green-600",
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-neutral-50">
      <Container>
        <div className="text-center mb-12 md:mb-16">
          <h2 className="mb-4">How It Works</h2>
          <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
            Getting professional help for your home has never been easier.
            Just three simple steps!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow"
            >
              {/* Step Number */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
                <span className="text-2xl font-bold bg-gradient-to-br from-primary-500 to-primary-700 bg-clip-text text-transparent">
                  {step.number}
                </span>
              </div>

              {/* Icon */}
              <div
                className={`w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center`}
              >
                <step.icon className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h4 className="text-xl font-semibold text-neutral-900 mb-3">
                {step.title}
              </h4>
              <p className="text-neutral-600 leading-relaxed">
                {step.description}
              </p>

              {/* Connector Arrow (Desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-6">
                  <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-neutral-300 border-b-8 border-b-transparent" />
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
