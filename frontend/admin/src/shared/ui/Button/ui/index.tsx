import { FunctionComponent } from "react";
import styles from "./styles.module.css";
import { ButtonProps } from "../lib/types";
import { Icon } from "../../Icon";
import classNames from "classnames";

export const Button: FunctionComponent<ButtonProps> = ({
  onClick,
  children,
  disabled = false,
  type = "button",
  size = "md",
  variant = "primary",
  status = "default",
  icon,
  className,
}) => {
  const buttonClassName = classNames(
    styles.button,
    styles[variant],
    !icon && styles[size],
    styles[status],
    { [styles.disabled]: disabled },
    className
  );

  return (
    <button
      type={type}
      disabled={disabled}
      className={buttonClassName}
      onClick={onClick}
    >
      {icon && <Icon type={icon} size={size} />}
      {children}
    </button>
  );
};
