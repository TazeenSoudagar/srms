"use client";

import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import Container from "@/components/layout/Container";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");

  const popularCategories = [
    "Cleaning",
    "Plumbing",
    "Electrical",
    "Carpentry",
    "Painting",
    "AC Repair",
  ];

  return (
    <section className="relative bg-gradient-to-br from-primary-50 via-white to-accent-50 py-16 md:py-24">
      <Container>
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <h1 className="mb-6 animate-fade-in">
            Professional Services at Your Doorstep
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
            Book trusted professionals for all your home service needs with just
            a few clicks. Quality service guaranteed.
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-lg p-2 md:p-3 mb-6 max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-2">
              {/* Service Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="What service are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 md:py-4 bg-neutral-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-900 placeholder:text-neutral-400"
                />
              </div>

              {/* Location (Future) */}
              <div className="relative md:w-64">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Bangalore"
                  className="w-full pl-12 pr-4 py-3 md:py-4 bg-neutral-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-900 placeholder:text-neutral-400"
                />
              </div>

              {/* Search Button */}
              <Button variant="primary" size="lg" className="md:px-8">
                Search
              </Button>
            </div>
          </div>

          {/* Popular Categories */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            <span className="text-sm text-neutral-600 self-center">
              Popular:
            </span>
            {popularCategories.map((category) => (
              <button
                key={category}
                className="px-4 py-2 bg-white hover:bg-primary-50 text-neutral-700 hover:text-primary-700 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all border border-neutral-200 hover:border-primary-300"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </Container>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200 rounded-full opacity-10 blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-200 rounded-full opacity-10 blur-3xl -z-10" />
    </section>
  );
}
