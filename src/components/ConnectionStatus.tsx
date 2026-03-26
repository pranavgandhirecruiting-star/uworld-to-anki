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
        <p>Make sure:</p>
        <ol>
          <li>Anki is open</li>
          <li>
            <a
              href="https://ankiweb.net/shared/info/2055492159"
              target="_blank"
              rel="noopener noreferrer"
            >
              AnkiConnect add-on
            </a>{" "}
            is installed (code: <code>2055492159</code>)
          </li>
          <li>
            AnkiConnect is configured to allow this origin (see setup below)
          </li>
        </ol>
        <details>
          <summary>AnkiConnect Setup</summary>
          <div className="setup-steps">
            <p>
              In Anki, go to <strong>Tools → Add-ons → AnkiConnect → Config</strong> and set:
            </p>
            <pre>{`{
  "apiKey": null,
  "apiLogPath": null,
  "ignoreOriginList": [],
  "webBindAddress": "127.0.0.1",
  "webBindPort": 8765,
  "webCorsOriginList": [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
  ]
}`}</pre>
            <p>Then restart Anki.</p>
          </div>
        </details>
        <button className="btn btn-sm" onClick={onRetry}>
          Retry Connection
        </button>
      </div>
    </div>
  );
}
