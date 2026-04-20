"use client";

import { useState } from "react";
import { ArrowRight, Clock } from "lucide-react";
import Card from "@/components/common/Card";
import Container from "@/components/layout/Container";
import Image from "next/image";
import Link from "next/link";

const posts = [
  {
    slug: "summer-ac-maintenance",
    category: "Maintenance Tips",
    title: "5 AC Maintenance Tips Before the Summer Heat Hits",
    excerpt:
      "Don't wait for your AC to break down on the hottest day of the year. Here's a quick pre-summer checklist to keep your unit running efficiently.",
    author: "Ravi Kumar",
    date: "April 10, 2026",
    readTime: "4 min read",
    image: "/ac_maintenance.png",
    featured: true,
  },
  {
    slug: "electrical-safety-home",
    category: "Safety",
    title: "7 Electrical Safety Rules Every Homeowner Should Know",
    excerpt:
      "Faulty wiring is one of the leading causes of house fires in India. Learn what warning signs to watch for and when to call a professional.",
    author: "Priya Nair",
    date: "April 3, 2026",
    readTime: "5 min read",
    image: "/electrical_safety.jpg",
    featured: false,
  },
  {
    slug: "monsoon-plumbing-prep",
    category: "Seasonal Guide",
    title: "How to Prepare Your Plumbing for the Monsoon Season",
    excerpt:
      "Clogged drains, leaky pipes, and waterlogging — monsoon can wreak havoc on your home's plumbing. Here's how to get ahead of it.",
    author: "Arjun Mehta",
    date: "March 25, 2026",
    readTime: "6 min read",
    image: "/plumbing.jpg",
    featured: false,
  },
  {
    slug: "deep-cleaning-guide",
    category: "Home Care",
    title: "The Ultimate Deep Cleaning Checklist for Indian Homes",
    excerpt:
      "Whether it's post-renovation dust or pre-festival cleaning, a thorough deep clean can transform your space. Here's a room-by-room guide.",
    author: "Ravi Kumar",
    date: "March 14, 2026",
    readTime: "7 min read",
    image: "/deep_cleaning.jpg",
    featured: false,
  },
  {
    slug: "when-to-call-professional",
    category: "DIY vs Professional",
    title: "DIY or Call a Pro? How to Decide for Common Home Issues",
    excerpt:
      "Some jobs are safe to DIY; others can turn into costly disasters. Here's a practical guide to knowing the difference.",
    author: "Priya Nair",
    date: "March 5, 2026",
    readTime: "5 min read",
    image: "/diy_or_pro.jpg",
    featured: false,
  },
  {
    slug: "water-heater-care",
    category: "Appliances",
    title: "Extend the Life of Your Water Heater with These Simple Habits",
    excerpt:
      "A little maintenance goes a long way. Learn how to flush, inspect, and care for your geyser to avoid early replacements.",
    author: "Arjun Mehta",
    date: "February 22, 2026",
    readTime: "4 min read",
    image: "/water_heater.jpg",
    featured: false,
  },
];

const categories = ["All", "Maintenance Tips", "Safety", "Seasonal Guide", "Home Care", "DIY vs Professional", "Appliances"];

export default function BlogContent() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All"
    ? posts
    : posts.filter((p) => p.category === activeCategory);

  const featured = filtered.find((p) => p.featured) ?? filtered[0];
  const rest = filtered.filter((p) => p.slug !== featured?.slug);

  return (
    <Container>
      <div className="py-12">
        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-primary-600 text-white"
                  : "bg-white border border-neutral-200 text-neutral-600 hover:border-primary-400 hover:text-primary-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-neutral-400 text-sm">No posts in this category yet.</div>
        ) : (
          <>
            {/* Featured / first post */}
            {featured && (
              <div className="mb-10">
                <Link href={`/blog/${featured.slug}`} className="block group">
                  <Card variant="elevated" padding="none">
                    <div className="grid md:grid-cols-2 gap-0">
                      <div className="relative h-56 md:h-auto min-h-56 rounded-t-xl md:rounded-l-xl md:rounded-tr-none overflow-hidden">
                        {featured.image ? (
                          <Image
                            src={featured.image}
                            alt={featured.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-700" />
                        )}
                      </div>
                      <div className="p-7 md:p-10 flex flex-col justify-center">
                        <span className="inline-block px-3 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full mb-3 w-fit">
                          {featured.category}
                        </span>
                        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-3 leading-snug group-hover:text-primary-700 transition-colors">
                          {featured.title}
                        </h2>
                        <p className="text-sm text-neutral-600 leading-relaxed mb-5">
                          {featured.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-neutral-500">
                            <span>{featured.author}</span>
                            <span className="mx-1.5">·</span>
                            <span>{featured.date}</span>
                          </div>
                          <span className="inline-flex items-center gap-1.5 text-sm text-primary-600 font-medium group-hover:gap-2.5 transition-all">
                            Read more <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            )}

            {/* Post Grid */}
            {rest.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-16">
                {rest.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
                    <Card variant="elevated" padding="none">
                      <div className="relative h-44 rounded-t-xl overflow-hidden">
                        {post.image ? (
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                            <span className="text-primary-400 text-3xl font-black opacity-50">
                              {post.category.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <span className="inline-block px-2.5 py-0.5 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full mb-3">
                          {post.category}
                        </span>
                        <h3 className="text-base font-semibold text-neutral-900 mb-2 leading-snug line-clamp-2 group-hover:text-primary-700 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-sm text-neutral-600 leading-relaxed line-clamp-3 mb-4">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                          <div className="flex items-center gap-1 text-xs text-neutral-500">
                            <Clock className="w-3 h-3" />
                            {post.readTime}
                          </div>
                          <span className="inline-flex items-center gap-1 text-xs text-primary-600 font-medium group-hover:gap-2 transition-all">
                            Read <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Container>
  );
}
