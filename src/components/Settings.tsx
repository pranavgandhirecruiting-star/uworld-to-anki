import { useState } from "react";
import {
  getApiKey,
  setApiKey,
  getModel,
  setModel,
  testApiKey,
  type ModelChoice,
} from "../api/claude";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function Settings({ open, onClose }: Props) {
  const [key, setKey] = useState(getApiKey());
  const [model, setModelState] = useState<ModelChoice>(getModel());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "fail" | null>(null);
  const [saved, setSaved] = useState(false);

  if (!open) return null;

  const handleSave = () => {
    setApiKey(key);
    setModel(model);
    setSaved(true);
    setTestResult(null);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const ok = await testApiKey(key);
    setTestResult(ok ? "success" : "fail");
    setTesting(false);
  };

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
          <label htmlFor="api-key">Anthropic API Key</label>
          <p className="settings-hint">
            Required for Smart Search. Get a key at{" "}
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
            >
              console.anthropic.com
            </a>
          </p>
          <div className="settings-row">
            <input
              id="api-key"
              type="password"
              className="settings-input"
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                setTestResult(null);
                setSaved(false);
              }}
              placeholder="sk-ant-..."
            />
            <button
              className="btn btn-sm"
              onClick={handleTest}
              disabled={!key || testing}
            >
              {testing ? "Testing..." : "Test"}
            </button>
          </div>
          {testResult === "success" && (
            <span className="settings-status success">Key is valid</span>
          )}
          {testResult === "fail" && (
            <span className="settings-status error">
              Invalid key or API error
            </span>
          )}
        </div>

        <div className="settings-section">
          <label htmlFor="model-select">Model</label>
          <p className="settings-hint">
            Haiku is fast and cheap (~$0.001/query). Sonnet is more accurate but
            slower (~$0.01/query).
          </p>
          <select
            id="model-select"
            className="settings-input"
            value={model}
            onChange={(e) => {
              setModelState(e.target.value as ModelChoice);
              setSaved(false);
            }}
          >
            <option value="claude-haiku-4-5-20251001">
              Claude Haiku 4.5 (fast, cheap)
            </option>
            <option value="claude-sonnet-4-5-20250514">
              Claude Sonnet 4.5 (more accurate)
            </option>
          </select>
        </div>

        <div className="settings-footer">
          <button className="btn btn-primary" onClick={handleSave}>
            {saved ? "Saved!" : "Save Settings"}
          </button>
          <p className="settings-privacy">
            Your API key is stored locally in your browser. It is never sent to
            any server other than the Anthropic API.
          </p>
        </div>
      </div>
    </div>
  );
}
