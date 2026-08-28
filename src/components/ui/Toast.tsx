import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "../../lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

type Listener = () => void;
let listeners: Listener[] = [];
let toasts: Toast[] = [];
let toastIdCounter = 0;

function emit() {
  listeners.forEach((listener) => listener());
}

export function addToast(toast: Omit<Toast, "id">): string {
  const id = `toast-${++toastIdCounter}`;
  toasts = [...toasts, { ...toast, id }];
  emit();
  return id;
}

export function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function updateToast(id: string, updates: Partial<Toast>) {
  toasts = toasts.map((t) => (t.id === id ? { ...t, ...updates } : t));
  emit();
}

function subscribe(listener: Listener) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot() {
  return toasts;
}

export function useToastStore() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

const toastIcons: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const iconStyles: Record<ToastType, string> = {
  success: "bg-emerald-500/15 text-emerald-500 dark:text-emerald-400",
  error: "bg-red-500/15 text-red-500 dark:text-red-400",
  warning: "bg-amber-500/15 text-amber-500 dark:text-amber-400",
  info: "bg-blue-500/15 text-blue-500 dark:text-blue-400",
};

const titleStyles: Record<ToastType, string> = {
  success: "text-emerald-700 dark:text-emerald-300",
  error: "text-red-700 dark:text-red-300",
  warning: "text-amber-700 dark:text-amber-300",
  info: "text-blue-700 dark:text-blue-300",
};

const progressStyles: Record<ToastType, string> = {
  success: "bg-emerald-400",
  error: "bg-red-400",
  warning: "bg-amber-400",
  info: "bg-blue-400",
};

const tintStyles: Record<ToastType, string> = {
  success: "bg-emerald-500",
  error: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-blue-500",
};

function ToastItem({ toast }: { toast: Toast }) {
  const duration = toast.duration ?? 5000;

  React.useEffect(() => {
    if (duration === Infinity) return;
    const timer = setTimeout(() => removeToast(toast.id), duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration]);

  const Icon = toastIcons[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="relative w-full max-w-sm overflow-hidden rounded-xl border border-border/30 bg-background/80 p-4 shadow-2xl backdrop-blur-xl"
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-[0.08] dark:opacity-[0.12]",
          tintStyles[toast.type],
        )}
      />

      <div className="relative flex items-start gap-3">
        <div className={cn("shrink-0 rounded-lg p-1.5", iconStyles[toast.type])}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className={cn("text-sm font-semibold leading-tight", titleStyles[toast.type])}>
            {toast.title}
          </p>
          {toast.message && (
            <p className="mt-1 text-xs leading-relaxed text-foreground/65 dark:text-foreground/80">
              {toast.message}
            </p>
          )}
          {toast.action && (
            <button
              type="button"
              onClick={toast.action.onClick}
              className="mt-2 text-xs font-medium underline underline-offset-2 hover:opacity-80"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => removeToast(toast.id)}
          className="shrink-0 rounded-md p-1 text-foreground opacity-50 transition-all hover:bg-foreground/10 hover:opacity-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {duration !== Infinity && (
        <motion.div
          className={cn(
            "absolute bottom-0 left-0 h-[3px] rounded-full",
            progressStyles[toast.type],
          )}
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: duration / 1000, ease: "linear" }}
        />
      )}
    </motion.div>
  );
}

export function ToastProvider() {
  const toasts = useToastStore();

  return (
    <div className="pointer-events-none fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function useToast() {
  const toast = React.useCallback((options: Omit<Toast, "id">) => addToast(options), []);

  const success = React.useCallback(
    (title: string, message?: string) =>
      addToast({ type: "success", title, message, duration: 5000 }),
    [],
  );

  const error = React.useCallback(
    (title: string, message?: string) =>
      addToast({ type: "error", title, message, duration: 8000 }),
    [],
  );

  const warning = React.useCallback(
    (title: string, message?: string) =>
      addToast({ type: "warning", title, message, duration: 6000 }),
    [],
  );

  const info = React.useCallback(
    (title: string, message?: string) => addToast({ type: "info", title, message, duration: 4000 }),
    [],
  );

  return { toast, success, error, warning, info, removeToast };
}
