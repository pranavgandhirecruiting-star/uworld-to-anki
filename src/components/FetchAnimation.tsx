import "./FetchAnimation.css";

interface Props {
  message?: string;
}

/**
 * Dog playing fetch loading animation.
 * A dog runs across the screen chasing a ball.
 */
export function FetchAnimation({ message = "Fetching..." }: Props) {
  return (
    <div className="fetch-animation">
      <div className="fetch-scene">
        {/* Ball bouncing ahead */}
        <div className="fetch-ball" />

        {/* Dog running */}
        <div className="fetch-dog">
          {/* Body */}
          <svg viewBox="0 0 80 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="dog-svg">
            {/* Body */}
            <ellipse cx="40" cy="28" rx="18" ry="12" fill="var(--accent, #7c3aed)" />

            {/* Head */}
            <circle cx="60" cy="20" r="10" fill="var(--accent, #7c3aed)" />

            {/* Ear flopping */}
            <path d="M65 14 C68 8 72 10 70 15" fill="#9461fb" className="dog-ear" />

            {/* Eye */}
            <circle cx="63" cy="18" r="1.5" fill="white" />
            <circle cx="63.5" cy="18" r="0.8" fill="#1a1a2e" />

            {/* Nose */}
            <circle cx="68" cy="22" r="1.5" fill="#1a1a2e" />

            {/* Mouth - happy panting */}
            <path d="M66 24 C67 26 65 27 64 26" stroke="#1a1a2e" strokeWidth="0.8" fill="none" />

            {/* Tongue */}
            <path d="M65 25 C65 28 63 29 63 27" fill="#f87171" className="dog-tongue" />

            {/* Front legs - alternating */}
            <line x1="50" y1="36" x2="54" y2="48" stroke="var(--accent, #7c3aed)" strokeWidth="3" strokeLinecap="round" className="leg-front-1" />
            <line x1="48" y1="36" x2="44" y2="48" stroke="var(--accent, #7c3aed)" strokeWidth="3" strokeLinecap="round" className="leg-front-2" />

            {/* Back legs - alternating */}
            <line x1="28" y1="36" x2="32" y2="48" stroke="var(--accent, #7c3aed)" strokeWidth="3" strokeLinecap="round" className="leg-back-1" />
            <line x1="26" y1="36" x2="22" y2="48" stroke="var(--accent, #7c3aed)" strokeWidth="3" strokeLinecap="round" className="leg-back-2" />

            {/* Tail wagging */}
            <path d="M22 22 C16 14 12 16 14 20" stroke="var(--accent, #7c3aed)" strokeWidth="3" strokeLinecap="round" fill="none" className="dog-tail" />
          </svg>
        </div>
      </div>

      {/* Ground */}
      <div className="fetch-ground" />

      <p className="fetch-message">{message}</p>
    </div>
  );
}
