import { useEffect, useRef, useState } from "react";
import type { UserProfile, UsageInfo } from "../api/backend";
import { FREE_DAILY_LIMIT, loginWithGoogle } from "../api/backend";

const EXAM_DATE_KEY = "ollopa-exam-date";

interface Props {
  user: UserProfile | null;
  usage: UsageInfo | null;
  connected: boolean;
  onLogin: (user: UserProfile, usage: UsageInfo) => void;
  onLogout: () => void;
  onUpgrade: () => void;
  onError: (msg: string) => void;
}

export function AuthBar({ user, usage, connected, onLogin, onLogout, onUpgrade, onError }: Props) {
  const btnRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [examDate, setExamDate] = useState(() => localStorage.getItem(EXAM_DATE_KEY) || "");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user || !btnRef.current) return;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const tryRender = () => {
      const google = (window as any).google;
      if (!google?.accounts?.id) {
        setTimeout(tryRender, 200);
        return;
      }

      google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential: string }) => {
          try {
            const { user, usage } = await loginWithGoogle(response.credential);
            onLogin(user, usage);
          } catch (err) {
            onError(err instanceof Error ? err.message : "Sign-in failed. Please try again.");
          }
        },
      });

      google.accounts.id.renderButton(btnRef.current!, {
        theme: "outline",
        size: "medium",
        text: "signin_with",
        shape: "rectangular",
      });
    };

    tryRender();
  }, [user, onLogin, onError]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  const handleExamDateChange = (value: string) => {
    setExamDate(value);
    if (value) {
      localStorage.setItem(EXAM_DATE_KEY, value);
    } else {
      localStorage.removeItem(EXAM_DATE_KEY);
    }
  };

  // Not logged in: just render the Google sign-in button
  if (!user) {
    return <div ref={btnRef} className="header-auth" />;
  }

  const smartUsed = usage?.smartSearches ?? 0;

  return (
    <div className="header-auth" ref={dropdownRef}>
      <button
        className="btn btn-ghost btn-sm auth-dropdown-toggle"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <span className="user-name">{user.name || user.email.split("@")[0]}</span>
        <span className={`plan-badge plan-${user.plan}`}>
          {user.plan === "pro" ? "Pro" : "Free"}
        </span>
        <span className="dropdown-arrow">{dropdownOpen ? "\u25B2" : "\u25BC"}</span>
      </button>

      {dropdownOpen && (
        <div className="auth-dropdown-menu">
          <div className="dropdown-section">
            <div className="dropdown-email">{user.email}</div>
            {user.plan === "free" && (
              <div className="dropdown-usage">
                {smartUsed}/{FREE_DAILY_LIMIT} Smart Searches used today
              </div>
            )}
          </div>

          <div className="dropdown-section">
            <label className="dropdown-label">Exam Date</label>
            <input
              type="date"
              className="dropdown-date-input"
              value={examDate}
              onChange={(e) => handleExamDateChange(e.target.value)}
            />
          </div>

          <div className="dropdown-section">
            <div className="dropdown-label">Anki Connection</div>
            <div className={`dropdown-status ${connected ? "connected" : "disconnected"}`}>
              {connected ? "Connected" : "Disconnected"}
            </div>
          </div>

          {user.plan === "free" && (
            <div className="dropdown-section">
              <button className="btn btn-primary btn-sm dropdown-upgrade" onClick={() => { onUpgrade(); setDropdownOpen(false); }}>
                Upgrade to Pro
              </button>
            </div>
          )}

          <div className="dropdown-section dropdown-section-last">
            <button className="btn btn-ghost btn-sm" onClick={() => { onLogout(); setDropdownOpen(false); }}>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
