"use client";

import { useEffect, useState } from "react";

type Testimonial = { quote: string; name: string; role: string };

export function TestimonialsCarousel({ testimonials: TESTIMONIALS }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (TESTIMONIALS.length < 2) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [TESTIMONIALS.length]);

  if (TESTIMONIALS.length === 0) return null;
  const current = TESTIMONIALS[index] ?? TESTIMONIALS[0];

  return (
    <section className="bg-[#f7f5ef] px-6 py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-bold text-[#0f3d63] sm:text-3xl">
          What Our Community Says
        </h2>
        <div className="mt-8 min-h-[140px]">
          <p className="text-lg italic opacity-80">&ldquo;{current.quote}&rdquo;</p>
          <p className="mt-4 text-sm font-semibold text-[#0f3d63]">
            {current.name}{" "}
            <span className="font-normal opacity-60">· {current.role}</span>
          </p>
        </div>
        <div className="mt-6 flex justify-center gap-2">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show testimonial ${i + 1}`}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                i === index ? "bg-[#0f3d63]" : "bg-[#0f3d63]/20"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
