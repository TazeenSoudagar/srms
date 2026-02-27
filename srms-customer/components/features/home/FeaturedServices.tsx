"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import Container from "@/components/layout/Container";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import { formatPrice } from "@/lib/utils/format";

export default function FeaturedServices() {
  const [scrollPosition, setScrollPosition] = useState(0);

  // Mock data - will be replaced with API call
  const services = [
    {
      id: "1",
      name: "Deep Home Cleaning",
      description: "Complete home cleaning with professional equipment",
      basePrice: 1499,
      rating: 4.8,
      reviewCount: 234,
      isPopular: true,
      image: "/images/services/deep-home-cleaning.jpg",
    },
    {
      id: "2",
      name: "Plumbing Repair",
      description: "Expert plumbers for all your plumbing needs",
      basePrice: 299,
      rating: 4.9,
      reviewCount: 189,
      isPopular: true,
      image: "/images/services/plumbing-repair.jpg",
    },
    {
      id: "3",
      name: "Electrical Services",
      description: "Licensed electricians for safe installations",
      basePrice: 399,
      rating: 4.7,
      reviewCount: 156,
      isPopular: false,
      image: "/images/services/electrical-services.jpg",
    },
    {
      id: "4",
      name: "AC Repair & Service",
      description: "AC installation, repair and maintenance",
      basePrice: 499,
      rating: 4.8,
      reviewCount: 203,
      isPopular: true,
      image: "/images/services/ac-repair.jpg",
    },
    {
      id: "5",
      name: "Painting Services",
      description: "Interior and exterior painting by experts",
      basePrice: 2999,
      rating: 4.6,
      reviewCount: 124,
      isPopular: false,
      image: "/images/services/painting-services.jpg",
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-white">
      <Container>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="mb-2">Featured Services</h2>
            <p className="text-neutral-600">
              Most booked and highly rated services
            </p>
          </div>
          <Link href="/services">
            <Button variant="ghost">View All</Button>
          </Link>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.slice(0, 6).map((service) => (
            <Link key={service.id} href={`/services/${service.id}`}>
              <Card variant="default" hoverable padding="none" className="h-full overflow-hidden">
                {/* Service Image */}
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {service.isPopular && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="warning" size="sm">
                        Popular
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Service Info */}
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-neutral-900 mb-2">
                    {service.name}
                  </h4>
                  <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                    {service.description}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-medium text-neutral-900">
                        {service.rating}
                      </span>
                    </div>
                    <span className="text-sm text-neutral-500">
                      ({service.reviewCount} reviews)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-neutral-600">
                        Starting at
                      </span>
                      <div className="text-xl font-bold text-primary-600">
                        {formatPrice(service.basePrice)}
                      </div>
                    </div>
                    <Button variant="primary" size="sm">
                      Book Now
                    </Button>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
