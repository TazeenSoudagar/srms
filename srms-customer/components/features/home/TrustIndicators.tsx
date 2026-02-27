import { Users, Shield, Star } from "lucide-react";
import Container from "@/components/layout/Container";

export default function TrustIndicators() {
  const stats = [
    {
      icon: Users,
      value: "10,000+",
      label: "Happy Customers",
      color: "text-primary-600",
      bg: "bg-primary-100",
    },
    {
      icon: Shield,
      value: "500+",
      label: "Verified Professionals",
      color: "text-accent-600",
      bg: "bg-accent-100",
    },
    {
      icon: Star,
      value: "4.8",
      label: "Average Rating",
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-white mb-4">Trusted by Thousands</h2>
          <p className="text-primary-100 text-lg max-w-2xl mx-auto">
            Join our growing community of satisfied customers who trust us for
            their home service needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-colors"
            >
              <div
                className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}
              >
                <stat.icon className="w-8 h-8" />
              </div>
              <div className="text-4xl md:text-5xl font-bold mb-2">
                {stat.value}
              </div>
              <div className="text-primary-100 text-lg">{stat.label}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
