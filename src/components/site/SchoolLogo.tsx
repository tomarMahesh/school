// Placeholder logo -- swap this file's contents for an <img src="/logo.png" .../>
// (or similar) once the school provides a real logo. Keeping it as one small
// component means every place the logo appears updates automatically.
export function SchoolLogo({ className = "" }: { className?: string }) {
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
