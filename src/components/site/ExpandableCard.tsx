"use client";

import { useState } from "react";

export function ExpandableCard({
  title,
  summary,
  details,
}: {
  title: string;
  summary: string;
  details: string[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-[#0f3d63]">{title}</h3>
      <p className="mt-2 text-sm opacity-70">{summary}</p>
      {open && (
        <ul className="mt-3 flex flex-col gap-1.5 text-sm opacity-70">
          {details.map((d) => (
            <li key={d} className="flex gap-2">
              <span className="text-[#d4a017]">•</span>
              <span>{d}</span>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mt-4 text-sm font-semibold text-[#0f3d63] underline underline-offset-2"
      >
        {open ? "Show less" : "Read more"}
      </button>
    </div>
  );
}
