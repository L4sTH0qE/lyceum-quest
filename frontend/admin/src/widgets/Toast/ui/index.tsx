import React from "react";
import styles from "./styles.module.css";
import { Icon } from "@/shared/ui/Icon";
import { ToastContext } from "@/app/providers/ToastProvider/api";
import { ToastProps } from "../types/types";

export const Toast: React.FC<ToastProps> = ({ id, variant, children }) => {
  const toastContext = React.useContext(ToastContext);

  if (!toastContext) {
    return null;
  }

  const { dismissToast } = toastContext;

  return (
    <div className={`${styles.toast} ${styles[variant]}`}>
      <div className={styles.iconContainer}>
        <Icon type={variant} size="sm" />
      </div>
      <p className={styles.content}>{children}</p>
      <button
        className={styles.closeButton}
        onClick={() => dismissToast(id)}
        aria-label="Dismiss message"
        aria-live="off"
      >
        <Icon size="sm" type="close" />
      </button>
    </div>
  );
};
