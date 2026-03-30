/**
 * Ollopa logo — the two "ll"s are textbooks leaning against each other.
 */
export function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Ollopa logo"
    >
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--accent, #7c3aed)" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>

      {/* Left book (first L) — leaning left */}
      <g transform="rotate(-14 18 40)">
        <rect x="16" y="8" width="6" height="32" rx="1.5" fill="var(--accent, #7c3aed)" />
        <rect x="17" y="9" width="4" height="30" rx="1" fill="#9461fb" opacity="0.7" />
        {/* Spine detail */}
        <line x1="19" y1="12" x2="19" y2="36" stroke="white" strokeWidth="0.5" opacity="0.3" />
      </g>

      {/* Right book (second L) — leaning right */}
      <g transform="rotate(14 30 40)">
        <rect x="26" y="8" width="6" height="32" rx="1.5" fill="var(--accent, #7c3aed)" />
        <rect x="27" y="9" width="4" height="30" rx="1" fill="#c4b5fd" opacity="0.6" />
        <line x1="29" y1="12" x2="29" y2="36" stroke="white" strokeWidth="0.5" opacity="0.3" />
      </g>

      {/* Small paw print at the base */}
      <circle cx="24" cy="44" r="1.8" fill="var(--accent, #7c3aed)" opacity="0.5" />
      <circle cx="21.5" cy="42" r="1" fill="var(--accent, #7c3aed)" opacity="0.4" />
      <circle cx="26.5" cy="42" r="1" fill="var(--accent, #7c3aed)" opacity="0.4" />
      <circle cx="22.5" cy="40" r="0.8" fill="var(--accent, #7c3aed)" opacity="0.3" />
      <circle cx="25.5" cy="40" r="0.8" fill="var(--accent, #7c3aed)" opacity="0.3" />
    </svg>
  );
}
