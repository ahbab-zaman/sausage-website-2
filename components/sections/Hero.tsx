"use client";

import Link from "next/link";
import Image from "next/image"; // Import Next.js Image for optimization
import { Button } from "@/components/ui/button";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import banner1 from "../../public/banner1.jpg";
import banner2 from "../../public/banner2.png";
import banner3 from "../../public/banner3.png";
import banner4 from "../../public/banner4.png";
import banner5 from "../../public/banner5.jpg";

// Hero slide data - now using static image paths
const heroSlides = [
  {
    title: "Discover Premium",
    subtitle: "Products",
    description:
      "Experience exceptional quality and modern design. Shop our curated collection of premium products crafted for the modern lifestyle.",
    imagePath: banner1, // Static image in public/images/
    badgeText: "50%",
    badgeLabel: "Special Offer",
    badgeSub: "Limited time only",
    primaryLink: "/products",
    secondaryLink: "/about"
  },
  {
    title: "Explore Luxury",
    subtitle: "Essentials",
    description:
      "Elevate your everyday with our handpicked selection of luxury essentials designed for sophistication and comfort.",
    imagePath: banner2, // Add your second static image here
    badgeText: "30%",
    badgeLabel: "Flash Sale",
    badgeSub: "Ends soon",
    primaryLink: "/products",
    secondaryLink: "/about"
  },
  {
    title: "Unleash Style",
    subtitle: "Innovation",
    description:
      "Step into the future of fashion with innovative designs that blend tradition and cutting-edge technology.",
    imagePath: banner4, // Add your third static image here
    badgeText: "20%",
    badgeLabel: "New Arrival",
    badgeSub: "Just in stock",
    primaryLink: "/products",
    secondaryLink: "/about"
  },
  {
    title: "Unleash Style",
    subtitle: "Innovation",
    description:
      "Step into the future of fashion with innovative designs that blend tradition and cutting-edge technology.",
    imagePath: banner5, // Add your third static image here
    badgeText: "20%",
    badgeLabel: "New Arrival",
    badgeSub: "Just in stock",
    primaryLink: "/products",
    secondaryLink: "/about"
  },
  {
    title: "Unleash Style",
    subtitle: "Innovation",
    description:
      "Step into the future of fashion with innovative designs that blend tradition and cutting-edge technology.",
    imagePath: banner3, // Add your third static image here
    badgeText: "20%",
    badgeLabel: "New Arrival",
    badgeSub: "Just in stock",
    primaryLink: "/products",
    secondaryLink: "/about"
  }
];

export default function Hero() {
  return (
    <section className="bg-[#F2F2F2]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{
            delay: 3000, // Changed to 3 seconds for auto-slide change
            disableOnInteraction: false, // Continues autoplay after user interaction
            pauseOnMouseEnter: true // Optional: Pauses on hover for better UX
          }}
          pagination={{ clickable: true, dynamicBullets: true }}
          loop={true}
          className="h-full"
          style={{ paddingBottom: "3rem" }}>
          {heroSlides.map((slide, index) => (
            <SwiperSlide key={index} className="flex justify-center">
              <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2">
                <div className="order-2 lg:order-1">
                  <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-6xl">
                    {slide.title}
                    <span className="text-primary block">{slide.subtitle}</span>
                  </h1>
                  <p className="mb-8 max-w-lg text-xl text-gray-600">{slide.description}</p>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <Link href={slide.primaryLink}>
                      <Button size="lg" className="w-full sm:w-auto">
                        Shop Now
                      </Button>
                    </Link>
                    <Link href={slide.secondaryLink}>
                      <Button variant="outline" size="lg" className="w-full sm:w-auto">
                        Learn More
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="relative order-1 lg:order-2">
                  <div className="relative mx-auto aspect-[4/3] max-w-md overflow-hidden rounded-2xl bg-gray-100 lg:max-w-none">
                    <Image
                      src={slide.imagePath}
                      alt={`${slide.title} Product`}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw" // Responsive sizing hint for optimization
                      priority={index === 0} // Preload only the first image
                    />
                  </div>
                  <div className="absolute -bottom-4 -left-4 rounded-xl bg-white p-4 shadow-lg md:-bottom-6 md:-left-6 md:p-6">
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-full text-xs md:h-12 md:w-12 md:text-base">
                        <span className="font-bold text-white">{slide.badgeText}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 md:text-base">
                          {slide.badgeLabel}
                        </p>
                        <p className="text-xs text-gray-600 md:text-sm">{slide.badgeSub}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
