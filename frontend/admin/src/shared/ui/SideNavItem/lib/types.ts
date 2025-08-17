import { MouseEvent, ReactNode } from "react";
import { IconType } from "../../Icon/lib/types";

export type Props = {
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
  type?: "submit";
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  iconName: IconType;
  href: string;
};
