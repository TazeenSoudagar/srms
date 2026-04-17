"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import Container from "@/components/layout/Container";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import { formatPrice } from "@/lib/utils/format";
import { servicesApi } from "@/lib/api/services";
import { Service } from "@/lib/types/service";

export default function FeaturedServices() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedServices = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await servicesApi.getFeatured(6);
        setServices(response.data);
      } catch (err) {
        console.error("Failed to fetch featured services:", err);
        setError("Failed to load featured services. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedServices();
  }, []);

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

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} variant="default" padding="none" className="h-full overflow-hidden">
                <div className="animate-pulse">
                  <div className="h-48 bg-neutral-200" />
                  <div className="p-6">
                    <div className="h-6 bg-neutral-200 rounded mb-2" />
                    <div className="h-4 bg-neutral-200 rounded mb-4 w-3/4" />
                    <div className="h-4 bg-neutral-200 rounded mb-4 w-1/2" />
                    <div className="flex justify-between items-center">
                      <div className="h-8 bg-neutral-200 rounded w-24" />
                      <div className="h-9 bg-neutral-200 rounded w-24" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button
              variant="primary"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Services Grid */}
        {!loading && !error && services.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Link key={service.id} href={`/services/${service.id}`}>
                <Card variant="default" hoverable padding="none" className="h-full overflow-hidden">
                  {/* Service Image */}
                  <div className="relative h-48 w-full overflow-hidden bg-neutral-200">
                    {service.image && (
                      <img
                        src={service.image}
                        alt={service.name}
                        className="h-full w-full object-cover"
                      />
                    )}
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
                    {(service.rating > 0 || service.reviewCount > 0) && (
                      <div className="flex items-center gap-2 mb-4">
                        {service.rating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="font-medium text-neutral-900">
                              {service.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                        {service.reviewCount > 0 && (
                          <span className="text-sm text-neutral-500">
                            ({service.reviewCount} reviews)
                          </span>
                        )}
                      </div>
                    )}

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
        )}

        {/* Empty State */}
        {!loading && !error && services.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-600">No featured services available at the moment.</p>
          </div>
        )}
      </Container>
    </section>
  );
}
