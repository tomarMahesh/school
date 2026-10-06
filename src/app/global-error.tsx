"use client";

// Last resort: replaces the whole page when the root layout itself fails, so it
// must bring its own <html>/<body> and plain inline styles (no global CSS here).
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          color: "#0f3d63",
          background: "#ffffff",
          textAlign: "center",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ opacity: 0.75, fontSize: 14 }}>
            The site hit an unexpected problem. Please try again in a moment.
          </p>
          {error.digest && (
            <p style={{ fontFamily: "monospace", fontSize: 12, opacity: 0.7 }}>
              Reference: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: 16,
              padding: "8px 20px",
              border: 0,
              borderRadius: 4,
              background: "#0f3d63",
              color: "#fff",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
