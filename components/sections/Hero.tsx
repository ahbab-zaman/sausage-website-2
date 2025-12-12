"use client";

import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

// Hero slide data matching the original structure
const heroSlides = [
  {
    title: "JUST LANDED!",
    text: "150 new reasons to raise a glass.",
    buttonText: "AVAILABLE NOW!",
    buttonLink: "/wine",
    imageDesktop:
      "https://thebottlestoredelivery.com/image/cache/catalog/-ADec%20Banners/NARRW-1600x900.jpg",
    imageMobile:
      "https://thebottlestoredelivery.com/image/cache/catalog/-ADec%20Banners/NARRW-1600x900.jpg",
    imageAlt: "JUST LANDED! Image Text"
  },
  {
    title: "Big Savings",
    text: "On Your Favourite Beers",
    buttonText: "Shop Now",
    buttonLink: "/beer-and-cider/beer",
    imageDesktop:
      "https://thebottlestoredelivery.com/image/cache/catalog/1ABC%20banners/March%202025/MarchDeals_Website1-1600x900.jpg",
    imageMobile:
      "https://thebottlestoredelivery.com/image/cache/catalog/1ABC%20banners/March%202025/MarchDeals_Website1-1600x900.jpg",
    imageAlt: "Big Savings Image Text"
  },
  {
    title: "NICE",
    text: "WINE IN A CAN",
    buttonText: null,
    buttonLink: null,
    imageDesktop:
      "https://thebottlestoredelivery.com/image/cache/catalog/-July%20banners/website/7-1600x900.png",
    imageMobile:
      "https://thebottlestoredelivery.com/image/cache/catalog/-July%20banners/website/7-1600x900.png",
    imageAlt: "NICE Image Text"
  },
  {
    title: "Patron El Cielo Prestige Silver Tequila",
    text: "The world's first four-times distilled luxury silver tequila with a subtly sweet and undeniably smooth finish.",
    buttonText: null,
    buttonLink: null,
    imageDesktop:
      "https://thebottlestoredelivery.com/image/cache/catalog/-September%20banners/Website/1-1600x900.png",
    imageMobile:
      "https://thebottlestoredelivery.com/image/cache/catalog/-September%20banners/Website/1-1600x900.png",
    imageAlt: "Patron El Cielo Prestige Silver Tequila Image Text"
  },
  {
    title: "Draught at Home!",
    text: "Enjoy bar quality pints from the comfort of your own home. Order our starter pack which includes the unit and 2 Heineken 8L Kegs!",
    buttonText: "Learn More",
    buttonLink: "/beer-and-cider/beer?product_id=16912",
    imageDesktop:
      "https://thebottlestoredelivery.com/image/cache/catalog/-September%20banners/Website/Blade2%20website-1600x900.png",
    imageMobile:
      "https://thebottlestoredelivery.com/image/cache/catalog/-September%20banners/Website/Blade2%20website-1600x900.png",
    imageAlt: "Draught at Home! Image Text"
  },
  {
    title: "Spend More Save More!",
    text: "The more you shop, the more you save!",
    buttonText: null,
    buttonLink: null,
    imageDesktop:
      "https://thebottlestoredelivery.com/image/cache/catalog/1ABC%20banners/more-is-more-website-1600x900.jpg",
    imageMobile:
      "https://thebottlestoredelivery.com/image/cache/catalog/1ABC%20banners/more-is-more-website-1600x900.jpg",
    imageAlt: "Spend More Save More! Image Text"
  }
];

export default function Hero() {
  return (
    <section id="home-slider" className="w-full py-6">
      <div className="home-slider-wrapper mx-auto w-[90%] bg-[#f2f2f2]">
        <div className="section-slider">
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false
            }}
            pagination={{
              clickable: true,
              dynamicBullets: false
            }}
            loop={true}
            className="w-full"
            style={{ height: "360px" }}>
            {heroSlides.map((slide, index) => (
              <SwiperSlide key={index}>
                <div className="single-cell-content flex h-[360px] w-full items-center">
                  {/* Text Side - Left */}
                  <div className="textSide flex w-1/2 flex-col justify-center px-8 md:px-12 lg:px-16">
                    <h2 className="textSide-title mb-4 text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl">
                      {slide.title}
                    </h2>
                    <p className="textSide-text mb-6 text-base text-gray-700 md:text-lg">
                      {slide.text}
                    </p>
                    {slide.buttonText && slide.buttonLink && (
                      <Link
                        href={slide.buttonLink}
                        className="textSide-btn buttonAnimation inline-flex w-fit items-center rounded-lg bg-gray-900 px-6 py-3 text-base font-semibold text-white transition-all duration-300 hover:bg-gray-800">
                        <span>{slide.buttonText}</span>
                      </Link>
                    )}
                  </div>

                  {/* Image Side - Right */}
                  <div className="imageSide h-full w-1/2">
                    <div className="relative h-full w-full">
                      <Image
                        src={slide.imageDesktop}
                        alt={slide.imageAlt}
                        width={1600}
                        height={900}
                        className="h-full w-full object-cover"
                        priority={index === 0}
                        quality={90}
                      />
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <style jsx global>{`
        .swiper-pagination {
          bottom: 10px !important;
        }

        .swiper-pagination-bullet {
          background: rgba(0, 0, 0, 0.3);
          opacity: 1;
          width: 8px;
          height: 8px;
        }

        .swiper-pagination-bullet-active {
          background: rgba(0, 0, 0, 0.8);
        }

        @media (max-width: 768px) {
          .single-cell-content {
            flex-direction: column;
          }

          .textSide,
          .imageSide {
            width: 100% !important;
          }

          .textSide {
            padding: 2rem 1rem;
          }
        }
      `}</style>
    </section>
  );
}
