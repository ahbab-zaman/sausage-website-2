"use client";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Quote } from "lucide-react";
import { useState } from "react";

interface Testimonial {
  quote: string;
  name: string;
  title: string;
  avatar: string;
}

const testimonials: Testimonial[] = [
  // Your existing testimonials here (keep all or add more)
  {
    quote:
      "Hume Connect has transformed how we monitor our patients. The BodyPod's 98% DEXA accuracy combined with AI-powered insights has eliminated our clinical blind spots completely.",
    name: "Dr. Sarah Mitchell",
    title: "Clinical Director",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg"
  },
  {
    quote:
      "The DSM program has been a game-changer. 60% margins with zero inventory risk? We've added $50K in monthly revenue.",
    name: "Michael Chen",
    title: "Gym Owner",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg"
  },
  {
    quote:
      "Best affiliate program I've joined. 30% commissions, top-notch support, and a product my audience genuinely loves.",
    name: "Jennifer Rodriguez",
    title: "Health & Wellness Influencer",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg"
  },
  {
    quote: "The remote monitoring capability has revolutionized our functional medicine practice.",
    name: "Dr. James Patterson",
    title: "Functional Medicine Practitioner",
    avatar: "https://randomuser.me/api/portraits/men/4.jpg"
  },
  {
    quote:
      "As a physical therapist, being able to track clients' progress remotely has been invaluable.",
    name: "Lisa Thompson",
    title: "Physical Therapist",
    avatar: "https://randomuser.me/api/portraits/women/5.jpg"
  },
  {
    quote:
      "Our wellness center has seen a 40% increase in patient retention since implementing Hume Connect.",
    name: "David Kumar",
    title: "Wellness Center Director",
    avatar: "https://randomuser.me/api/portraits/men/6.jpg"
  },
  {
    quote: "The wholesale program made it easy to add BodyPods to our retail locations.",
    name: "Amanda Foster",
    title: "Retail Operations Manager",
    avatar: "https://randomuser.me/api/portraits/women/7.jpg"
  },
  // Duplicate or add more for density
  {
    quote: "I've promoted many health products, but Hume Health's conversion rates are unmatched.",
    name: "Carlos Martinez",
    title: "Fitness Influencer",
    avatar: "https://randomuser.me/api/portraits/men/8.jpg"
  },
  {
    quote: "The integration with our EHR was seamless and game-changing.",
    name: "Dr. Rachel Kim",
    title: "Medical Director",
    avatar: "https://randomuser.me/api/portraits/women/9.jpg"
  }
  // Add as many as you want...
];

const MarqueeRow = ({
  items,
  speed,
  reverse = false
}: {
  items: Testimonial[];
  speed: number;
  reverse?: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="animate-marquee-horizontal flex w-max gap-6"
      style={{
        animationDuration: `${speed}s`,
        animationDirection: reverse ? "reverse" : "normal",
        animationPlayState: isHovered ? "paused" : "running"
      }}
      onMouseEnter={() => setIsHovered(false)}
      onMouseLeave={() => setIsHovered(false)}>
      {[...items, ...items].map((t, i) => (
        <Card
          key={i}
          className="max-w-[300px] flex-shrink-0 rounded-2xl border bg-white/80 p-6 shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <Quote className="w-8 text-cyan-500/30" />
          <p className="line-clamp-4 text-sm leading-relaxed text-gray-700">{t.quote}</p>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-cyan-500/20">
              <AvatarImage src={t.avatar} alt={t.name} />
              <AvatarFallback>
                {t.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-gray-900">{t.name}</p>
              <p className="text-sm text-gray-600">{t.title}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default function Testimonials() {
  // Split into two rows for visual interest
  const row1 = testimonials.slice(0, Math.ceil(testimonials.length / 2));
  const row2 = testimonials.slice(Math.ceil(testimonials.length / 2));

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-cyan-50 py-20">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 via-transparent to-blue-50/50 py-4" />

      <div className="relative z-10 mx-auto px-4 md:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
            Testimonials
          </h2>
          <p className="mt-6 text-lg text-gray-600 opacity-75">
            Join successful practitioners, resellers, and affiliates thriving with our platform
          </p>
        </div>

        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_15%,black_85%,transparent_100%)] px-8">
          <div className="flex w-full flex-col gap-8 py-4">
            <MarqueeRow items={row1} speed={80} />
            <MarqueeRow items={row2} speed={100} reverse />
          </div>
        </div>
      </div>
    </section>
  );
}
