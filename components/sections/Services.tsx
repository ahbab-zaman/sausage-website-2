"use client";

import { useState } from "react";
import { DollarSign, Truck, Users, ChevronLeft, ChevronRight, Zap } from "lucide-react";

const Services = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const services = [
    {
      icon: Zap,
      title: "Lightning-Fast Service",
      description:
        "Your order delivered in under 90 mins anywhere in Abu Dhabi between 9am and 11:00pm 7 days a week!",
      note: "(excluding western region)",
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100"
    },
    {
      icon: DollarSign,
      title: "Spend more, save more",
      list: [
        "Spend AED 300 get 5% discount",
        "Spend AED 450 get 10% discount",
        "Spend AED 750 get 15% discount"
      ],
      iconColor: "text-green-600",
      iconBg: "bg-green-100"
    },
    {
      icon: Truck,
      title: "Free Delivery",
      description: "Free delivery for orders over AED 100 (excluding certain areas)",
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100"
    },
    {
      icon: Users,
      title: "Refer a friend",
      description: "Refer your friends and get 30% off!",
      link: "Click here to learn more",
      iconColor: "text-orange-600",
      iconBg: "bg-orange-100"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % services.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + services.length) % services.length);
  };

  return (
    <div className="mx-auto w-[90%] py-12">
      {/* Desktop View - Grid */}
      <div className="hidden grid-cols-1 gap-6 md:grid md:grid-cols-2 lg:grid-cols-4">
        {services.map((service, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-[#faf4f4] p-8 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <div className="relative">
              <div
                className={`mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl ${service.iconBg} shadow-md transition-transform duration-300 group-hover:scale-110`}>
                <service.icon className={`h-10 w-10 ${service.iconColor}`} strokeWidth={2.5} />
              </div>

              <h3 className="mb-4 text-xl font-bold text-black">{service.title}</h3>

              {service.description && (
                <div>
                  <p className="mb-2 text-sm leading-relaxed font-semibold text-black">
                    {service.description}
                  </p>
                  {service.note && (
                    <p className="text-xs font-semibold text-black">{service.note}</p>
                  )}
                </div>
              )}

              {service.list && (
                <ul className="space-y-2">
                  {service.list.map((item, i) => (
                    <li key={i} className="flex items-start text-sm font-semibold text-black">
                      <span
                        className={`mt-1 mr-2 h-2 w-2 flex-shrink-0 rounded-full ${service.iconColor.replace("text", "bg")}`}></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {service.link && (
                <a
                  href="#"
                  className="mt-4 inline-flex items-center text-sm font-bold text-black underline transition-all duration-300 hover:opacity-70">
                  {service.link}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile View - Carousel */}
      <div className="relative md:hidden">
        <div className="overflow-hidden rounded-2xl">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {services.map((service, index) => (
              <div key={index} className="w-full flex-shrink-0 px-2">
                <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-[#f2f2f2] p-8 shadow-lg">
                  <div className="relative">
                    <div
                      className={`mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl ${service.iconBg} shadow-md`}>
                      <service.icon
                        className={`h-10 w-10 ${service.iconColor}`}
                        strokeWidth={2.5}
                      />
                    </div>

                    <h3 className="mb-4 text-xl font-bold text-black">{service.title}</h3>

                    {service.description && (
                      <div>
                        <p className="mb-2 text-sm leading-relaxed font-semibold text-black">
                          {service.description}
                        </p>
                        {service.note && (
                          <p className="text-xs font-semibold text-black">{service.note}</p>
                        )}
                      </div>
                    )}

                    {service.list && (
                      <ul className="space-y-2">
                        {service.list.map((item, i) => (
                          <li key={i} className="flex items-start text-sm font-semibold text-black">
                            <span
                              className={`mt-1 mr-2 h-2 w-2 flex-shrink-0 rounded-full ${service.iconColor.replace("text", "bg")}`}></span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {service.link && (
                      <a
                        href="#"
                        className="mt-4 inline-flex items-center text-sm font-bold text-black underline transition-all duration-300 hover:opacity-70">
                        {service.link}
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-0 z-10 -translate-x-3 -translate-y-1/2 rounded-full bg-white p-3 shadow-xl transition-all duration-300 hover:scale-110 hover:bg-gray-50 active:scale-95"
          aria-label="Previous slide">
          <ChevronLeft className="h-5 w-5 text-gray-800" strokeWidth={3} />
        </button>

        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-0 z-10 translate-x-3 -translate-y-1/2 rounded-full bg-white p-3 shadow-xl transition-all duration-300 hover:scale-110 hover:bg-gray-50 active:scale-95"
          aria-label="Next slide">
          <ChevronRight className="h-5 w-5 text-gray-800" strokeWidth={3} />
        </button>

        {/* Pagination Dots */}
        <div className="mt-6 flex justify-center gap-2">
          {services.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === index ? "w-8 bg-gray-800" : "w-2 bg-gray-300"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
