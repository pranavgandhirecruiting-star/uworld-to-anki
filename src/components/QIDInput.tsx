import { useState } from "react";
import { parseQIDs } from "../utils/parseQIDs";

interface Props {
  onSubmit: (qids: string[]) => void;
  loading: boolean;
  disabled: boolean;
}

export function QIDInput({ onSubmit, loading, disabled }: Props) {
  const [input, setInput] = useState("");

  const parsed = parseQIDs(input);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsed.length === 0 || disabled) return;
    onSubmit(parsed);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    // Let the default paste happen, then parse
    const pasted = e.clipboardData.getData("text");
    const combined = input + pasted;
    const qids = parseQIDs(combined);
    if (qids.length > 0) {
      // Will be handled by onChange
    }
  };

  return (
    <form onSubmit={handleSubmit} className="qid-input">
      <label htmlFor="qid-textarea">
        Paste your missed QIDs from UWorld
      </label>
      <textarea
        id="qid-textarea"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onPaste={handlePaste}
        placeholder={`Paste QIDs here — any format works:\n2127, 8425, 12007\nQID 2127\n#2127 #8425`}
        rows={5}
        disabled={loading}
        autoFocus
      />
      <div className="qid-input-footer">
        <span className="qid-count">
          {parsed.length > 0
            ? `${parsed.length} QID${parsed.length === 1 ? "" : "s"} detected: ${parsed.join(", ")}`
            : "Waiting for QIDs..."}
        </span>
        <div className="qid-actions">
          {input && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setInput("")}
              disabled={loading}
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={parsed.length === 0 || disabled || loading}
          >
            {loading ? "Searching Anki..." : "Find Cards"}
          </button>
        </div>
      </div>
    </form>
  );
}
