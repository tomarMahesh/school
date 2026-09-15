"use client";

import { useEffect, useState } from "react";

// Placeholder slides -- replace `image` with a real photo URL per slide
// (e.g. "/campus-1.jpg" from the public/ folder) once photos are available.
// The `label` stays as a caption hinting what each slide should show.
const SLIDES = [
  { label: "Campus View", gradient: "from-[#0f3d63] to-[#154f80]" },
  { label: "Smart Classroom", gradient: "from-[#154f80] to-[#0a2540]" },
  { label: "Sports Day", gradient: "from-[#0a2540] to-[#1c5f8a]" },
  { label: "Annual Function", gradient: "from-[#1c5f8a] to-[#0f3d63]" },
] as const;

const INTERVAL_MS = 5000;

export function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {SLIDES.map((slide, i) => (
        <div
          key={slide.label}
          className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-1000 ${slide.gradient} ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            className="absolute inset-0 m-auto h-40 w-40 text-white/10"
            fill="currentColor"
          >
            <path d="M12 2 1 8l11 6 9-4.91V17h2V8L12 2Zm0 13.6L4 11.2V16c0 2.21 3.58 4 8 4s8-1.79 8-4v-4.8l-8 4.4Z" />
          </svg>
          <span className="absolute bottom-6 left-6 rounded bg-black/30 px-3 py-1 text-xs text-white/70">
            {slide.label} (photo placeholder)
          </span>
        </div>
      ))}

      <div className="absolute inset-0 bg-black/35" />

      <button
        type="button"
        aria-label="Previous slide"
        onClick={() => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40"
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={() => setIndex((i) => (i + 1) % SLIDES.length)}
        className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40"
      >
        ›
      </button>

      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.label}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-2 w-2 rounded-full transition-colors ${
              i === index ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
