import Hero from "@/components/sections/Hero";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import Categories from "@/components/sections/Categories";
import Testimonials from "@/components/sections/Testimonials";
import Newsletter from "@/components/sections/Newsletter";
import Services from "@/components/sections/Services";
import { AppStore } from "@/components/sections/AppStore";
import RecommendedSection from "@/components/sections/RecommendedSection";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Services />
      <FeaturedProducts />
      <RecommendedSection />
      <AppStore />
      {/* <Categories />
      <Testimonials />
      <Newsletter /> */}
    </main>
  );
}
