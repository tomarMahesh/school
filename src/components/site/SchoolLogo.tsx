// Shows the admin-uploaded logo (Settings > School Logo) when `src` is
// given, otherwise the built-in "SBS" placeholder. Keeping every logo
// spot on this one component means they all update together.
export function SchoolLogo({
  className = "",
  src,
}: {
  className?: string;
  src?: string | null;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="School logo" className={`${className} object-contain`} />;
  }

  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label="School logo placeholder"
    >
      <circle cx="24" cy="24" r="23" fill="#0f3d63" stroke="#d4a017" strokeWidth="2" />
      <text
        x="24"
        y="30"
        textAnchor="middle"
        fontSize="16"
        fontWeight="700"
        fill="#f4b400"
        fontFamily="Georgia, serif"
      >
        SBS
      </text>
    </svg>
  );
}
