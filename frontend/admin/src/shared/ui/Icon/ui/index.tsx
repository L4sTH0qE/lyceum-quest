import { FunctionComponent } from "react";
import { iconsMap, IconType } from "../lib/types";
import styles from "./styles.module.css";

export const Icon: FunctionComponent<{
  type: IconType;
  size: "sm" | "md" | "lg" | "xl";
  className?: string[];
}> = ({ type, size, className }) => {
  const iconSizeMap = {
    sm: 16,
    md: 16,
    lg: 20,
    xl: 24,
  };

  const SvgIcon = iconsMap[type];

  return SvgIcon ? (
    <SvgIcon
      width={iconSizeMap[size]}
      height={iconSizeMap[size]}
      className={[...(className || []).map((cn) => styles[cn])].join(" ")}
    />
  ) : null;
};
