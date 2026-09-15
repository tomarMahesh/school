export function NoticeMarquee({ notices }: { notices: string[] }) {
  if (notices.length === 0) return null;

  // Duplicate the list so the CSS animation can loop seamlessly.
  const items = [...notices, ...notices];

  return (
    <div className="flex items-stretch overflow-hidden bg-[#d4a017] text-sm font-medium text-[#0f3d63]">
      <span className="shrink-0 bg-red-600 px-4 py-2 font-semibold text-white">
        Notices
      </span>
      <div className="flex flex-1 items-center overflow-hidden py-2">
        <div className="marquee-track flex shrink-0 gap-16 whitespace-nowrap pl-4">
          {items.map((notice, i) => (
            <span key={i}>{notice}</span>
          ))}
        </div>
      </div>
      <style>{`
        .marquee-track {
          animation: marquee 30s linear infinite;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
