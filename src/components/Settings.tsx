interface Props {
  open: boolean;
  onClose: () => void;
}

export function Settings({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="settings-section">
          <label>About Ollopa</label>
          <p className="settings-hint">
            Ollopa connects to your local Anki installation and uses AI to help
            you find and study the right cards. Sign in with Google to unlock
            Smart Search and Study Plans.
          </p>
        </div>

        <div className="settings-section">
          <label>Local Anki Connection</label>
          <p className="settings-hint">
            Ollopa communicates with Anki via a lightweight server running at{" "}
            <code>localhost:28735</code>. Keep Anki open while using Ollopa.
          </p>
        </div>

        <div className="settings-footer">
          <p className="settings-privacy">
            Your card data never leaves your machine. AI analysis is handled
            securely through Ollopa's servers.
          </p>
        </div>
      </div>
    </div>
  );
}
