import { createContext, useContext } from "react";

export interface Toast {
  show: (text: string, kind?: "info" | "error") => void;
}

export const ToastContext = createContext<Toast>({ show: () => {} });

export const useToast = () => useContext(ToastContext);
