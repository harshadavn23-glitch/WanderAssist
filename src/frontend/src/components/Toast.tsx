import { cn } from "@/lib/utils";
import type { ToastMessage } from "@/types/travel";
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";

interface ToastProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    className:
      "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400",
    iconClass: "text-green-500",
  },
  error: {
    icon: AlertCircle,
    className: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
    iconClass: "text-red-500",
  },
  warning: {
    icon: AlertTriangle,
    className:
      "border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    iconClass: "text-yellow-500",
  },
  info: {
    icon: Info,
    className: "border-primary/30 bg-primary/10 text-foreground",
    iconClass: "text-primary",
  },
};

function ToastItem({ toast, onRemove }: ToastProps) {
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border shadow-elevated backdrop-blur-sm",
        "animate-slide-up max-w-sm w-full",
        config.className,
      )}
    >
      <Icon className={cn("w-5 h-5 mt-0.5 shrink-0", config.iconClass)} />
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        className="shrink-0 opacity-60 hover:opacity-100 transition-fast"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
}
