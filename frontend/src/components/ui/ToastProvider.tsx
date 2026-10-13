import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ToastContext } from "./toastContext";

const DURATION_MS = 2600;

// Short confirmation messages at the bottom of the screen (replaces window.alert).
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ text: string; kind: "info" | "error"; id: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback((text: string, kind: "info" | "error" = "info") => {
    clearTimeout(timer.current);
    setToast({ text, kind, id: Date.now() });
    timer.current = setTimeout(() => setToast(null), DURATION_MS);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);
  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <div key={toast.id} role="status" className={`toast ${toast.kind === "error" ? "error" : ""}`}>
          {toast.text}
        </div>
      )}
    </ToastContext.Provider>
  );
}
