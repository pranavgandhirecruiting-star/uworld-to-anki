import { useEffect, useRef } from "react";
import type { UserProfile, UsageInfo } from "../api/backend";
import { FREE_DAILY_LIMIT, getSmartSearchesUsedToday, loginWithGoogle } from "../api/backend";

interface Props {
  user: UserProfile | null;
  usage: UsageInfo | null;
  onLogin: (user: UserProfile, usage: UsageInfo) => void;
  onLogout: () => void;
  onUpgrade: () => void;
  onError: (msg: string) => void;
}

export function AuthBar({ user, usage, onLogin, onLogout, onUpgrade, onError }: Props) {
  const btnRef = useRef<HTMLDivElement>(null);

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

  if (!user) {
    const anonUsed = getSmartSearchesUsedToday();
    return (
      <div className="auth-bar">
        <div className="auth-bar-usage">
          {anonUsed > 0 && (
            <span className="usage-count">
              Smart Search: {anonUsed}/{FREE_DAILY_LIMIT} free today
            </span>
          )}
        </div>
        <div ref={btnRef} />
      </div>
    );
  }

  const smartUsed = usage?.smartSearches ?? 0;

  return (
    <div className="auth-bar">
      <div className="auth-bar-user">
        <span className="user-name">{user.name || user.email}</span>
        <span className={`plan-badge plan-${user.plan}`}>
          {user.plan === "pro" ? "Pro" : "Free"}
        </span>
        {user.plan === "free" && (
          <span className="usage-count">
            {smartUsed}/{FREE_DAILY_LIMIT} searches today
          </span>
        )}
      </div>
      <div className="auth-bar-actions">
        {user.plan === "free" && (
          <button className="btn btn-primary btn-sm" onClick={onUpgrade}>
            Upgrade to Pro
          </button>
        )}
        <button className="btn btn-ghost btn-sm" onClick={onLogout}>
          Sign out
        </button>
      </div>
    </div>
  );
}
