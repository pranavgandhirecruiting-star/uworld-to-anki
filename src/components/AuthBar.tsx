import type { UserProfile, UsageInfo } from "../api/backend";
import { FREE_DAILY_LIMIT, getSmartSearchesUsedToday } from "../api/backend";

interface Props {
  user: UserProfile | null;
  usage: UsageInfo | null;
  onLogin: () => void;
  onLogout: () => void;
  onUpgrade: () => void;
}

export function AuthBar({ user, usage, onLogin, onLogout, onUpgrade }: Props) {
  if (!user) {
    // Show anonymous usage for smart search
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
        <button className="btn btn-sm" onClick={onLogin}>
          Sign in with Google
        </button>
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
