import BlogContent from "./BlogContent";
import Container from "@/components/layout/Container";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Tips, guides, and insights on home maintenance and services.",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div
        className="relative py-16 md:py-24 bg-cover bg-center"
        style={{ backgroundImage: "url('/blog.avif')"}}
      >
        <Container>
          <div className="relative text-center max-w-xl mx-auto">
            <div className="inline-block bg-white/90 rounded-2xl px-10 py-8 shadow-md">
              <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">
                SRMS Blog
              </h1>
              <p className="text-neutral-600">
                Tips, guides, and insights to help you keep your home in great shape.
              </p>
            </div>
          </div>
        </Container>
      </div>

      <BlogContent />
    </div>
  );
}
