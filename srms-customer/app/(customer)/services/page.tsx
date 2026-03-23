"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Star, Search, Filter } from "lucide-react";
import Container from "@/components/layout/Container";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import { servicesApi, categoriesApi } from "@/lib/api/services";
import { Service, ServiceCategory } from "@/lib/types/service";
import { formatPrice } from "@/lib/utils/format";

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams?.get("category") || "all"
  );

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch categories
      const categoriesResponse = await categoriesApi.getAll();
      setCategories(categoriesResponse.data || []);

      // Fetch services
      const servicesResponse = await servicesApi.getAll({
        categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
      });
      setServices(servicesResponse.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <Container>
        {/* Header */}
        <div className="py-8 md:py-12">
          <h1 className="mb-4">Our Services</h1>
          <p className="text-lg text-neutral-600">
            Professional home services delivered with care and quality
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === "all"
                  ? "bg-primary-600 text-white"
                  : "bg-white text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              All Services
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.id
                    ? "bg-primary-600 text-white"
                    : "bg-white text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <p className="text-neutral-600">Loading services...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-neutral-600">No services found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
            {filteredServices.map((service) => (
              <Link
                key={service.id}
                href={`/services/${service.id}`}
                className="block"
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  {service.image && (
                    <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                      <img
                        src={service.image}
                        alt={service.name}
                        className="h-full w-full object-cover"
                      />
                      {service.isPopular && (
                        <Badge className="absolute top-3 right-3 bg-accent-500 text-white">
                          Popular
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="p-5">
                    <h4 className="mb-2 font-semibold">{service.name}</h4>
                    <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                      {service.description}
                    </p>

                    {service.rating && (
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{service.rating}</span>
                        </div>
                        {service.reviewCount && (
                          <span className="text-sm text-neutral-500">
                            ({service.reviewCount} reviews)
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-neutral-500">Starting at</p>
                        <p className="text-xl font-bold text-primary-600">
                          {formatPrice(service.basePrice)}
                        </p>
                      </div>
                      <Button size="sm">Book Now</Button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
