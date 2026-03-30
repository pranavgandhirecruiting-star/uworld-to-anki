interface Props {
  connected: boolean | null;
  checking: boolean;
  onRetry: () => void;
}

export function ConnectionStatus({ connected, checking, onRetry }: Props) {
  if (checking && connected === null) {
    return (
      <div className="connection-status connecting">
        <span className="status-dot pulsing" />
        Connecting to Anki...
      </div>
    );
  }

  if (connected) {
    return (
      <div className="connection-status connected">
        <span className="status-dot green" />
        Connected to Anki
      </div>
    );
  }

  return (
    <div className="connection-status disconnected">
      <span className="status-dot red" />
      <div className="connection-help">
        <strong>Can't reach Anki</strong>
        <p>
          This page is served by the Ollopa add-on inside Anki.
          If you're seeing this, Anki may not be running or the add-on
          isn't loaded.
        </p>
        <p>
          Open Anki and go to <strong>Tools → Ollopa</strong> to
          relaunch this page.
        </p>
        <button className="btn btn-sm" onClick={onRetry}>
          Retry Connection
        </button>
      </div>
    </div>
  );
}
