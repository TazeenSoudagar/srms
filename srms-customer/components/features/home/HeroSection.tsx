"use client";

import { ChevronLeft, ChevronRight, MapPin, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/common/Button";
import Container from "@/components/layout/Container";
import { servicesApi } from "@/lib/api/services";
import type { Service } from "@/lib/types/service";

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("Bangalore");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [popularServices, setPopularServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const router = useRouter();

  const backgroundImages = [
    "/bg-1.jpg",
    "/bg-2.jpg",
    "/bg-3.jpg",
    "/bg-4.jpg",
  ];

  // Fetch popular services on mount
  useEffect(() => {
    const fetchPopularServices = async () => {
      try {
        setIsLoadingServices(true);
        const response = await servicesApi.getPopularServices(6);
        setPopularServices(response.data);
      } catch (error) {
        console.error("Failed to fetch popular services:", error);
        // On error, set empty array to hide the section gracefully
        setPopularServices([]);
      } finally {
        setIsLoadingServices(false);
      }
    };

    fetchPopularServices();
  }, []);

  // Auto-play carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentSlide((prev) => (prev + 1) % backgroundImages.length);
    }, 4000); // 4 seconds per slide

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // Handle transition end
  useEffect(() => {
    if (isTransitioning) {
      const timeout = setTimeout(() => setIsTransitioning(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isTransitioning]);

  const goToSlide = useCallback((index: number) => {
    setIsTransitioning(true);
    setCurrentSlide(index);
  }, []);

  const goToPrevious = useCallback(() => {
    setIsTransitioning(true);
    setCurrentSlide(
      (prev) => (prev - 1 + backgroundImages.length) % backgroundImages.length
    );
  }, [backgroundImages.length]);

  const goToNext = useCallback(() => {
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % backgroundImages.length);
  }, [backgroundImages.length]);

  // Preload images
  useEffect(() => {
    backgroundImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Handle search
  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!searchQuery.trim()) {
      return;
    }

    // Navigate to services page with search params
    const params = new URLSearchParams();
    params.set("search", searchQuery.trim());
    if (location) {
      params.set("location", location);
    }

    router.push(`/services?${params.toString()}`);
  };

  // Handle service click
  const handleServiceClick = (serviceName: string) => {
    setSearchQuery(serviceName);
    // Navigate to services page with service search
    const params = new URLSearchParams();
    params.set("search", serviceName);
    if (location) {
      params.set("location", location);
    }
    router.push(`/services?${params.toString()}`);
  };

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background Carousel */}
      <div className="absolute inset-0">
        {backgroundImages.map((image, index) => (
          <div
            key={image}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
            style={{ backgroundImage: `url('${image}')` }}
          />
        ))}
      </div>

      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/85 to-primary-50/90" />

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-neutral-700 p-2 rounded-full shadow-lg hover:shadow-xl transition-all opacity-0 md:opacity-100 hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-neutral-700 p-2 rounded-full shadow-lg hover:shadow-xl transition-all opacity-0 md:opacity-100 hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Navigation Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {backgroundImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-primary-600 w-8"
                : "bg-white/70 hover:bg-white"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Content */}
      <Container className="relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <h1 className="mb-6 animate-fade-in text-neutral-900">
            Professional Services at Your Doorstep
          </h1>
          <p className="text-lg md:text-xl text-neutral-700 mb-8 max-w-2xl mx-auto font-medium">
            Book trusted professionals for all your home service needs with just
            a few clicks. Quality service guaranteed.
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-2xl shadow-lg p-2 md:p-3 mb-6 max-w-3xl mx-auto"
          >
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

              {/* Location */}
              <div className="relative md:w-64">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 md:py-4 bg-neutral-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-900 placeholder:text-neutral-400"
                />
              </div>

              {/* Search Button */}
              <Button type="submit" variant="primary" size="lg" className="md:px-8">
                Search
              </Button>
            </div>
          </form>

          {/* Popular Services */}
          {isLoadingServices ? (
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              <span className="text-sm text-neutral-600 self-center">
                Popular:
              </span>
              {/* Loading skeleton */}
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="px-4 py-2 bg-neutral-200 rounded-full text-sm font-medium animate-pulse h-9 w-24"
                />
              ))}
            </div>
          ) : popularServices.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              <span className="text-sm text-neutral-600 self-center">
                Popular:
              </span>
              {popularServices.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => handleServiceClick(service.name)}
                  className="px-4 py-2 bg-white hover:bg-primary-50 text-neutral-700 hover:text-primary-700 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all border border-neutral-200 hover:border-primary-300"
                >
                  {service.name}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
