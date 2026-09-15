export default function GalleryPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-center text-3xl font-bold">Gallery</h1>
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-[#0f3d63]/10 to-[#d4a017]/10 text-[#0f3d63]/40"
          >
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor">
              <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2Zm-11-5 2.5 3.01L16 13l4 5H4Z" />
            </svg>
            <span className="text-xs">Photo placeholder</span>
          </div>
        ))}
      </div>
      <p className="mt-8 text-center text-xs opacity-50">
        School photos will appear here once uploaded.
      </p>
    </div>
  );
}
