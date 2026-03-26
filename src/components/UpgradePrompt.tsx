import { FREE_DAILY_LIMIT } from "../api/backend";

interface Props {
  isLoggedIn: boolean;
  onLogin: () => void;
  onUpgrade: () => void;
}

export function UpgradePrompt({ isLoggedIn, onLogin, onUpgrade }: Props) {
  return (
    <div className="upgrade-prompt">
      <div className="upgrade-prompt-header">
        You've used {FREE_DAILY_LIMIT}/{FREE_DAILY_LIMIT} free Smart Searches
        today
      </div>
      {!isLoggedIn ? (
        <>
          <p>
            Sign in to get {FREE_DAILY_LIMIT} free searches every day, or
            upgrade to Pro for unlimited.
          </p>
          <div className="upgrade-prompt-actions">
            <button className="btn btn-primary" onClick={onLogin}>
              Sign in with Google
            </button>
            <button className="btn btn-ghost" onClick={onUpgrade}>
              Learn about Pro
            </button>
          </div>
        </>
      ) : (
        <>
          <p>Upgrade to Pro for unlimited Smart Searches and Study Plans.</p>
          <div className="upgrade-prompt-actions">
            <button className="btn btn-primary" onClick={onUpgrade}>
              Upgrade to Pro — $6/month
            </button>
          </div>
        </>
      )}
    </div>
  );
}
