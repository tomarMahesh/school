export function NoticeMarquee({ notices }: { notices: string[] }) {
  if (notices.length === 0) return null;

  // Duplicate the list so the CSS animation can loop seamlessly.
  const items = [...notices, ...notices];

  return (
    <div className="fixed inset-x-0 top-[60px] z-40 flex items-center gap-3 overflow-hidden bg-[#d4a017] py-1.5 text-sm font-medium text-[#0f3d63]">
      <span className="shrink-0 border-r border-[#0f3d63]/30 px-3">Notices</span>
      <div className="marquee-track flex shrink-0 gap-16 whitespace-nowrap">
        {items.map((notice, i) => (
          <span key={i}>{notice}</span>
        ))}
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
