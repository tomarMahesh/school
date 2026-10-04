"use client";

import { useState } from "react";
import { Check } from "lucide-react";

export type PickerImage = { url: string; label: string };

export function ImagePicker({
  name,
  defaultValue,
  options,
}: {
  name: string;
  defaultValue: string;
  options: PickerImage[];
}) {
  const [value, setValue] = useState(defaultValue);
  // Keep the current image selectable even if it was later deleted from the gallery.
  const all = options.some((o) => o.url === value)
    ? options
    : [{ url: value, label: "Current image" }, ...options];

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={value} />
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {all.map((opt) => {
          const selected = opt.url === value;
          return (
            <button
              key={opt.url}
              type="button"
              onClick={() => setValue(opt.url)}
              aria-pressed={selected}
              title={opt.label}
              className={`relative overflow-hidden rounded-md border-2 transition ${
                selected ? "border-primary" : "border-transparent hover:border-border"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={opt.url} alt={opt.label} className="aspect-[4/3] w-full object-cover" />
              {selected && (
                <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3 w-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
