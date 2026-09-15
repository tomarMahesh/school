// Placeholder contact numbers -- replace with the school's real phone/WhatsApp number.
const PHONE = "+91-00000-00000";
const WHATSAPP = "910000000000";

export function FloatingActions() {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
      <a
        href={`https://wa.me/${WHATSAPP}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg transition-transform hover:scale-105"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
          <path d="M12.01 2C6.48 2 2 6.36 2 11.75c0 1.98.62 3.82 1.68 5.36L2 22l5.1-1.62a10.2 10.2 0 0 0 4.9 1.24h.01c5.53 0 10.01-4.36 10.01-9.75C22 6.36 17.53 2 12.01 2Zm0 17.8h-.01a8.3 8.3 0 0 1-4.2-1.14l-.3-.18-3.02.96.98-2.87-.2-.3a7.7 7.7 0 0 1-1.28-4.24c0-4.36 3.66-7.9 8.03-7.9 2.15 0 4.16.82 5.68 2.31a7.68 7.68 0 0 1 2.35 5.51c0 4.36-3.66 7.85-8.03 7.85Zm4.4-5.88c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.55.12-.16.24-.63.78-.77.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.17-.71-.63-1.19-1.4-1.33-1.64-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.8-.2-.48-.4-.42-.55-.42h-.47c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.03s.87 2.36 1 2.52c.12.16 1.7 2.6 4.13 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.43-.58 1.63-1.15.2-.56.2-1.04.14-1.15-.06-.1-.22-.16-.46-.28Z" />
        </svg>
      </a>
      <a
        href={`tel:${PHONE}`}
        aria-label="Call the school"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0f3d63] text-white shadow-lg transition-transform hover:scale-105"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C11.6 21 3 12.4 3 2c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.3 1l-2.2 2.2Z" />
        </svg>
      </a>
    </div>
  );
}
