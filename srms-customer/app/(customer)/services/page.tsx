"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Star, Search, ChevronLeft, ChevronRight } from "lucide-react";
import Container from "@/components/layout/Container";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import { servicesApi, categoriesApi } from "@/lib/api/services";
import { Service, ServiceCategory } from "@/lib/types/service";
import { formatPrice } from "@/lib/utils/format";

const PER_PAGE = 12;

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(
    searchParams?.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams?.get("category") || "all"
  );
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams?.get("page") || 1)
  );

  const fetchServices = useCallback(
    async (page: number, category: string, search: string) => {
      try {
        setLoading(true);
        const response = await servicesApi.getPaginated(page, PER_PAGE, {
          categoryId: category !== "all" ? category : undefined,
          search: search || undefined,
        });
        setServices(response.data || []);
        // Laravel returns snake_case meta
        setMeta((response as unknown as { meta: PaginationMeta }).meta ?? null);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Fetch categories once
  useEffect(() => {
    categoriesApi.getAll().then((res) => setCategories(res.data || []));
  }, []);

  // Fetch services whenever page / category changes
  useEffect(() => {
    fetchServices(currentPage, selectedCategory, searchQuery);
  }, [currentPage, selectedCategory, fetchServices]);

  // Debounced search — fires 400 ms after the user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchServices(1, selectedCategory, searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Build page number array with ellipsis
  const buildPageNumbers = (current: number, last: number): (number | "...")[] => {
    if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (current > 3) pages.push("...");
    for (let i = Math.max(2, current - 1); i <= Math.min(last - 1, current + 1); i++) {
      pages.push(i);
    }
    if (current < last - 2) pages.push("...");
    pages.push(last);
    return pages;
  };

  const pageNumbers = meta ? buildPageNumbers(meta.current_page, meta.last_page) : [];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Container>
        {/* Header */}
        <div className="py-6">
          <p className="text-lg font-semibold text-neutral-900 mb-1">Our Services</p>
          <p className="text-sm text-neutral-500">
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
          <div className="flex gap-1.5 flex-wrap bg-white border border-neutral-200 p-1 rounded-lg w-fit">
            <button
              onClick={() => handleCategoryChange("all")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                selectedCategory === "all"
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              All Services
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  selectedCategory === category.id
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Result count */}
          {meta && !loading && (
            <p className="text-sm text-neutral-500">
              Showing{" "}
              <span className="font-medium text-neutral-700">
                {(meta.current_page - 1) * meta.per_page + 1}–
                {Math.min(meta.current_page * meta.per_page, meta.total)}
              </span>{" "}
              of <span className="font-medium text-neutral-700">{meta.total}</span> services
            </p>
          )}
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
            {Array.from({ length: PER_PAGE }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl animate-pulse h-72" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-neutral-600">No services found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
            {services.map((service) => (
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
                    <p className="text-sm font-semibold text-neutral-900 mb-1.5">{service.name}</p>
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
                        <p className="text-lg font-bold text-primary-600">
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

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-center gap-1 py-8">
            {/* Previous */}
            <button
              onClick={() => handlePageChange(meta.current_page - 1)}
              disabled={meta.current_page === 1}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1 mx-2">
              {pageNumbers.map((page, idx) =>
                page === "..." ? (
                  <span key={`ellipsis-${idx}`} className="px-3 py-2 text-neutral-400 text-sm">
                    …
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`min-w-[36px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      page === meta.current_page
                        ? "bg-primary-600 text-white"
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            {/* Next */}
            <button
              onClick={() => handlePageChange(meta.current_page + 1)}
              disabled={meta.current_page === meta.last_page}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </Container>
    </div>
  );
}
