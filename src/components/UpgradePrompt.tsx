import { FREE_DAILY_LIMIT } from "../api/backend";

interface Props {
  isLoggedIn: boolean;
  onUpgrade: () => void;
}

export function UpgradePrompt({ isLoggedIn, onUpgrade }: Props) {
  return (
    <div className="upgrade-prompt">
      <div className="upgrade-prompt-header">
        You've used {FREE_DAILY_LIMIT}/{FREE_DAILY_LIMIT} free Smart Searches
        today
      </div>
      {!isLoggedIn ? (
        <p>
          Sign in above to get {FREE_DAILY_LIMIT} free Smart Searches daily.
        </p>
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
