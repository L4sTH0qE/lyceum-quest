import { useKeydown } from "@/features/ToastKeydown/use-keydown";
import { IconType } from "@/shared/ui/Icon/lib/types";
import { createContext, useCallback, useState } from "react";
import { Toast, ToastContextType, ToastProviderProps } from "../types/types";

export const ToastContext = createContext<ToastContextType | undefined>(
  undefined
);

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    );
  }, []);

  const handleEscape = useCallback(() => {
    setToasts([]);
  }, []);

  useKeydown("Escape", handleEscape);

  const startDismissToast = useCallback(
    (id: string) => {
      setToasts((currentToasts) =>
        currentToasts.map((toast) =>
          toast.id === id ? { ...toast, isDismissing: true } : toast
        )
      );

      setTimeout(() => {
        dismissToast(id);
      }, 1000);
    },
    [dismissToast]
  );

  const createToast = useCallback(
    (message: string, variant: IconType) => {
      const id = crypto.randomUUID();

      setToasts((prevToasts) => [
        ...prevToasts.slice(-4),
        {
          id,
          message,
          variant,
        },
      ]);

      setTimeout(() => {
        startDismissToast(id);
      }, 4000);
    },
    [startDismissToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, createToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  );
};
