import { useState, useEffect, useCallback } from "react";
import { checkConnection } from "../api/ankiConnect";

export function useAnkiConnection() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  const check = useCallback(async () => {
    setChecking(true);
    const ok = await checkConnection();
    setConnected(ok);
    setChecking(false);
  }, []);

  useEffect(() => {
    check();
    // Re-check every 10 seconds
    const interval = setInterval(check, 10_000);
    return () => clearInterval(interval);
  }, [check]);

  return { connected, checking, retry: check };
}
