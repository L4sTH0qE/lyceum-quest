import { MouseEvent, ReactNode } from "react";
import { IconType } from "../../Icon/lib/types";

export type Props = {
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
  type?: "submit";
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  icon: string;
};

export interface ButtonProps {
  onClick?: () => void;
  children?: ReactNode;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "secondary" | "additional" | "transparent";
  status?: "default" | "hover" | "focused" | "disabled" | "pending";
  icon?: IconType;
  className?: string;
}
