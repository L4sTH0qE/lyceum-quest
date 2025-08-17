import { IconType } from "@/shared/ui/Icon/lib/types";

export interface ToastProps {
  id: string;
  variant: IconType;
  children: React.ReactNode;
}
