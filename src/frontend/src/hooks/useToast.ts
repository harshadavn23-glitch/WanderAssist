import type { ToastMessage } from "@/types/travel";
import { useCallback, useState } from "react";

let toastIdCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (message: string, type: ToastMessage["type"] = "info") => {
      const id = `toast-${++toastIdCounter}`;
      const newToast: ToastMessage = { id, message, type };

      setToasts((prev) => [...prev, newToast]);

      // Auto-dismiss after 4s
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);

      return id;
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (message: string) => addToast(message, "success"),
    [addToast],
  );

  const error = useCallback(
    (message: string) => addToast(message, "error"),
    [addToast],
  );

  const info = useCallback(
    (message: string) => addToast(message, "info"),
    [addToast],
  );

  const warning = useCallback(
    (message: string) => addToast(message, "warning"),
    [addToast],
  );

  return { toasts, addToast, removeToast, success, error, info, warning };
}
