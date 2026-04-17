"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Shield,
  Users,
  Award,
  Calendar,
  ChevronRight,
} from "lucide-react";
import Container from "@/components/layout/Container";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import { servicesApi } from "@/lib/api/services";
import { Service } from "@/lib/types/service";
import { formatPrice } from "@/lib/utils/format";

export default function ServiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params?.id as string;

  const [service, setService] = useState<Service | null>(null);
  const [relatedServices, setRelatedServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (serviceId) {
      fetchServiceDetails();
    }
  }, [serviceId]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch service details
      const serviceResponse = await servicesApi.getById(serviceId);
      const serviceData = serviceResponse.data;
      setService(serviceData);

      // Fetch related services from the same category
      if (serviceData.category?.id) {
        const relatedResponse = await servicesApi.getAll({
          categoryId: serviceData.category.id,
        });
        const related = (relatedResponse.data || [])
          .filter((s) => s.id !== serviceId)
          .slice(0, 4);
        setRelatedServices(related);
      }
    } catch (err: any) {
      console.error("Error fetching service details:", err);
      setError(
        err.response?.data?.message || "Failed to load service details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = () => {
    if (service) {
      router.push(`/my-requests/new?service=${service.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Container>
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
            <p className="mt-4 text-neutral-600">Loading service details...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Container>
          <div className="py-20 text-center">
            <p className="text-red-600 mb-4">{error || "Service not found"}</p>
            <Button onClick={() => router.push("/services")} variant="outline">
              Back to Services
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  const keyFeatures = [
    {
      icon: Shield,
      title: "Verified Professionals",
      description: "All service providers are background-checked and verified",
    },
    {
      icon: Award,
      title: "Quality Guaranteed",
      description: "100% satisfaction guarantee or your money back",
    },
    {
      icon: Users,
      title: "Experienced Team",
      description: "Trained professionals with years of experience",
    },
    {
      icon: Calendar,
      title: "Flexible Scheduling",
      description: "Book at your convenience with flexible time slots",
    },
  ];

  const benefits = [
    "Professional and trained service providers",
    "Transparent pricing with no hidden costs",
    "Timely service delivery",
    "Quality equipment and materials",
    "Post-service support and warranty",
    "Easy rescheduling and cancellation",
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Back Navigation */}
      <div className="bg-white border-b border-neutral-200">
        <Container>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 py-4 text-neutral-700 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back</span>
          </button>
        </Container>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 py-8 lg:py-12">
            {/* Left: Service Image */}
            <div className="order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] bg-neutral-100">
                {service.image ? (
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">{service.category.icon || "🛠️"}</div>
                      <p className="text-neutral-500">No image available</p>
                    </div>
                  </div>
                )}
                {service.isPopular && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-md text-sm font-semibold shadow-md">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      Popular
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Service Info */}
            <div className="order-1 lg:order-2 flex flex-col justify-center">
              {/* Category Badge */}
              <div className="mb-3">
                <Badge variant="primary" size="md">
                  {service.category.name}
                </Badge>
              </div>

              {/* Service Name */}
              <h1 className="text-3xl md:text-4xl mb-3">{service.name}</h1>

              {/* Rating */}
              {service.rating && (
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex items-center gap-1 bg-green-600 text-white px-2.5 py-1 rounded-md text-sm font-semibold">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span>{service.rating}</span>
                  </div>
                  {service.reviewCount && (
                    <span className="text-neutral-600 text-sm">
                      {service.reviewCount.toLocaleString()} reviews
                    </span>
                  )}
                </div>
              )}

              {/* Description */}
              <p className="text-base text-neutral-700 mb-5 leading-relaxed">
                {service.description}
              </p>

              {/* Duration */}
              {service.averageDuration && (
                <div className="flex items-center gap-2 text-neutral-600 text-sm mb-5">
                  <Clock className="h-4 w-4 text-primary-600" />
                  <span>
                    Average duration: {Math.floor(service.averageDuration / 60)}h{" "}
                    {service.averageDuration % 60}m
                  </span>
                </div>
              )}

              {/* Pricing and CTA */}
              <div className="bg-white rounded-lg p-5 shadow-md border border-neutral-200">
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Starting at</p>
                    <p className="text-3xl font-bold text-primary-600">
                      {formatPrice(service.basePrice)}
                    </p>
                  </div>
                  <p className="text-xs text-neutral-500">+ applicable taxes</p>
                </div>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleBookService}
                >
                  Book Now
                </Button>
                <p className="text-xs text-neutral-500 text-center mt-2.5">
                  Final price will be confirmed after assessment
                </p>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Key Features Section */}
      <div className="bg-white py-12 lg:py-16">
        <Container>
          <h2 className="text-center mb-10">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyFeatures.map((feature, index) => (
              <Card
                key={index}
                padding="lg"
                className="text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h5 className="mb-2">{feature.title}</h5>
                <p className="text-sm text-neutral-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </div>

      {/* What's Included Section */}
      <div className="bg-neutral-50 py-12 lg:py-16">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-center mb-10">What's Included</h2>
            <Card padding="lg" variant="elevated">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-neutral-700">{benefit}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </Container>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-12 lg:py-16">
        <Container>
          <h2 className="text-center mb-10">How It Works</h2>
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Book Online",
                  description:
                    "Select your service and choose a convenient time slot",
                },
                {
                  step: "2",
                  title: "Expert Arrives",
                  description:
                    "Our verified professional arrives at your doorstep",
                },
                {
                  step: "3",
                  title: "Job Done",
                  description:
                    "Service completed with quality guarantee and support",
                },
              ].map((step, index) => (
                <div key={index} className="text-center relative">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white text-3xl font-bold mb-4 shadow-lg">
                    {step.step}
                  </div>
                  <h4 className="mb-2">{step.title}</h4>
                  <p className="text-neutral-600">{step.description}</p>
                  {index < 2 && (
                    <ChevronRight className="hidden md:block absolute top-8 -right-4 h-8 w-8 text-neutral-300" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </Container>
      </div>

      {/* Related Services Section */}
      {relatedServices.length > 0 && (
        <div className="bg-neutral-50 py-12 lg:py-16">
          <Container>
            <div className="flex items-center justify-between mb-8">
              <h2>Related Services</h2>
              <Link
                href={`/services?category=${service.category.slug || service.category.id}`}
                className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                View All
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedServices.map((relatedService) => (
                <Link
                  key={relatedService.id}
                  href={`/services/${relatedService.id}`}
                  className="block"
                >
                  <Card hoverable padding="none" className="h-full">
                    {relatedService.image && (
                      <div className="relative h-40 w-full overflow-hidden">
                        <img
                          src={relatedService.image}
                          alt={relatedService.name}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h6 className="mb-2 line-clamp-2">
                        {relatedService.name}
                      </h6>
                      <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
                        {relatedService.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary-600">
                          {formatPrice(relatedService.basePrice)}
                        </span>
                        {relatedService.rating && (
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">
                              {relatedService.rating}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </Container>
        </div>
      )}

      {/* Sticky Bottom CTA (Mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4 shadow-lg z-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-neutral-500">Starting at</p>
            <p className="text-xl font-bold text-primary-600">
              {formatPrice(service.basePrice)}
            </p>
          </div>
          <Button size="md" onClick={handleBookService} className="flex-1 max-w-xs">
            Book Now
          </Button>
        </div>
      </div>

      {/* Add padding at bottom for mobile sticky CTA */}
      <div className="lg:hidden h-24" />
    </div>
  );
}
