import { IconType } from "@/shared/ui/Icon/lib/types";
import { ReactNode } from "react";

export interface Toast {
  id: string;
  message: string;
  variant: IconType;
  isDismissing?: boolean;
}

export interface ToastContextType {
  toasts: Toast[];
  createToast: (message: string, variant: IconType) => void;
  dismissToast: (id: string) => void;
}

export interface ToastProviderProps {
  children: ReactNode;
}
