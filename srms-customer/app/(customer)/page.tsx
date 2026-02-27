import HeroSection from "@/components/features/home/HeroSection";
import CategoryGrid from "@/components/features/home/CategoryGrid";
import FeaturedServices from "@/components/features/home/FeaturedServices";
import HowItWorks from "@/components/features/home/HowItWorks";
import TrustIndicators from "@/components/features/home/TrustIndicators";

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <CategoryGrid />
      <FeaturedServices />
      <HowItWorks />
      <TrustIndicators />
    </div>
  );
}
