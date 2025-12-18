import Hero from "@/components/sections/Hero";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import Services from "@/components/sections/Services";
import { AppStore } from "@/components/sections/AppStore";
import RecommendedSection from "@/components/sections/RecommendedSection";
import Testimonials from "@/components/sections/Testimonal";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Services />
      <FeaturedProducts />
      <RecommendedSection />
      <AppStore />
      <Testimonials />
    </main>
  );
}
