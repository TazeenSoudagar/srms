"use client";

import Link from "next/link";
import {
  Wrench,
  Droplets,
  Zap,
  Paintbrush,
  Hammer,
  Wind,
  Sparkles,
  Home,
} from "lucide-react";
import Container from "@/components/layout/Container";
import Card from "@/components/common/Card";

export default function CategoryGrid() {
  const categories = [
    {
      name: "Plumbing",
      icon: Droplets,
      description: "Pipe repairs, installations & more",
      href: "/services?category=plumbing",
      color: "bg-blue-100 text-blue-600",
    },
    {
      name: "Electrical",
      icon: Zap,
      description: "Wiring, fixtures & repairs",
      href: "/services?category=electrical",
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      name: "Home Cleaning",
      icon: Sparkles,
      description: "Deep cleaning & maintenance",
      href: "/services?category=home-cleaning",
      color: "bg-purple-100 text-purple-600",
    },
    {
      name: "Carpentry",
      icon: Hammer,
      description: "Furniture & woodwork",
      href: "/services?category=carpentry",
      color: "bg-orange-100 text-orange-600",
    },
    {
      name: "Painting",
      icon: Paintbrush,
      description: "Interior & exterior painting",
      href: "/services?category=painting",
      color: "bg-pink-100 text-pink-600",
    },
    {
      name: "AC & Appliance Repair",
      icon: Wind,
      description: "Installation & servicing",
      href: "/services?category=ac-appliance-repair",
      color: "bg-cyan-100 text-cyan-600",
    },
    {
      name: "Home Repair",
      icon: Wrench,
      description: "General home repairs",
      href: "/services?category=home-repair",
      color: "bg-green-100 text-green-600",
    },
    {
      name: "Pest Control",
      icon: Home,
      description: "Pest & termite treatment",
      href: "/services?category=pest-control",
      color: "bg-indigo-100 text-indigo-600",
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-white">
      <Container>
        <div className="text-center mb-12">
          <h2 className="mb-4">Browse by Category</h2>
          <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
            Find the perfect service for your needs from our wide range of
            categories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link key={category.name} href={category.href}>
              <Card
                variant="default"
                hoverable
                className="h-full text-center group"
              >
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <category.icon className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-semibold text-neutral-900 mb-2">
                  {category.name}
                </h4>
                <p className="text-sm text-neutral-600">
                  {category.description}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
