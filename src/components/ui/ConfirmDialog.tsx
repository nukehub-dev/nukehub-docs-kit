import * as React from "react";
import { AlertTriangle, Trash2, Ban, RefreshCw, type LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./Button";
import { Modal } from "./Modal";

export type ConfirmVariant = "danger" | "warning" | "info" | "destructive";

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  icon?: LucideIcon;
  typeToConfirm?: string;
  customContent?: React.ReactNode;
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  resolve: ((value: boolean) => void) | null;
}

const variantConfig: Record<
  ConfirmVariant,
  { icon: LucideIcon; color: string; buttonClassName: string }
> = {
  danger: {
    icon: Trash2,
    color: "text-destructive",
    buttonClassName: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  },
  destructive: {
    icon: Ban,
    color: "text-destructive",
    buttonClassName: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-500",
    buttonClassName: "bg-primary text-primary-foreground hover:bg-primary/90",
  },
  info: {
    icon: RefreshCw,
    color: "text-primary",
    buttonClassName: "bg-primary text-primary-foreground hover:bg-primary/90",
  },
};

export function useConfirmDialog() {
  const [state, setState] = React.useState<ConfirmState>({
    isOpen: false,
    title: "",
    description: "",
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
    variant: "info",
    resolve: null,
  });
  const [typedText, setTypedText] = React.useState("");

  const confirm = React.useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setTypedText("");
      setState({
        ...options,
        confirmLabel: options.confirmLabel ?? "Confirm",
        cancelLabel: options.cancelLabel ?? "Cancel",
        variant: options.variant ?? "info",
        isOpen: true,
        resolve,
      });
    });
  }, []);

  const resolve = state.resolve;

  const handleClose = React.useCallback(
    (value: boolean) => {
      resolve?.(value);
      setState((prev) => ({ ...prev, isOpen: false, resolve: null }));
      setTypedText("");
    },
    [resolve],
  );

  const config = variantConfig[state.variant ?? "info"];
  const Icon = state.icon ?? config.icon;

  const confirmDisabled =
    !!state.typeToConfirm &&
    typedText.toLowerCase().trim() !== state.typeToConfirm.toLowerCase().trim();

  const dialog = (
    <Modal
      open={state.isOpen}
      onOpenChange={(v) => handleClose(v)}
      showClose={false}
      className={state.typeToConfirm || state.customContent ? "max-w-lg" : "max-w-md"}
    >
      <div
        className={cn(
          "h-1 w-full",
          state.variant === "danger" || state.variant === "destructive"
            ? "bg-destructive"
            : state.variant === "warning"
              ? "bg-amber-500"
              : "bg-primary",
        )}
      />

      <div className="p-6">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl",
              state.variant === "danger" || state.variant === "destructive"
                ? "bg-destructive/10"
                : state.variant === "warning"
                  ? "bg-amber-500/10"
                  : "bg-primary/10",
            )}
          >
            <Icon className={cn("h-5 w-5", config.color)} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold">{state.title}</h3>
            {state.description && (
              <p className="mt-1 text-sm text-muted-foreground">{state.description}</p>
            )}
          </div>
        </div>

        {state.customContent && <div className="mt-4">{state.customContent}</div>}

        {state.typeToConfirm && (
          <div className="mt-5 space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Type <span className="text-foreground">{state.typeToConfirm}</span> to confirm
            </label>
            <input
              type="text"
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              placeholder={`Type ${state.typeToConfirm} to confirm`}
              className="w-full rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm transition-colors placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !confirmDisabled) {
                  e.preventDefault();
                  handleClose(true);
                }
              }}
              autoFocus
            />
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-border/50 pt-4 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => handleClose(false)} className="w-full sm:w-auto">
            {state.cancelLabel}
          </Button>
          <Button
            onClick={() => handleClose(true)}
            className={cn("w-full sm:w-auto", config.buttonClassName)}
            disabled={confirmDisabled}
          >
            {state.confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );

  return { confirm, dialog };
}
