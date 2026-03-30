/**
 * Ollopa logo — a paw print, sized to sit inline with the wordmark.
 */
export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Ollopa logo"
    >
      {/* Main pad */}
      <ellipse cx="24" cy="30" rx="11" ry="9.5" fill="var(--accent, #7c3aed)" />

      {/* Toe beans — four small ovals */}
      <ellipse cx="13.5" cy="18" rx="4.2" ry="5" transform="rotate(-10 13.5 18)" fill="var(--accent, #7c3aed)" />
      <ellipse cx="22" cy="13.5" rx="3.8" ry="5" transform="rotate(-3 22 13.5)" fill="var(--accent, #7c3aed)" />
      <ellipse cx="26" cy="13.5" rx="3.8" ry="5" transform="rotate(3 26 13.5)" fill="var(--accent, #7c3aed)" />
      <ellipse cx="34.5" cy="18" rx="4.2" ry="5" transform="rotate(10 34.5 18)" fill="var(--accent, #7c3aed)" />
    </svg>
  );
}
