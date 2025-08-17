import React from "react";
import styles from "./styles.module.css";
import { Toast } from "@/widgets/Toast/ui";
import { ToastContext } from "@/app/providers/ToastProvider/api";

export const ToastShelf: React.FC = () => {
  const toastContext = React.useContext(ToastContext);

  if (!toastContext) {
    return null;
  }

  const { toasts } = toastContext;

  return (
    <ol
      className={styles.wrapper}
      role="region"
      aria-live="assertive"
      aria-label="Notification"
    >
      {toasts.map((toast) => (
        <li key={toast.id} className={styles.toastWrapper}>
          <Toast id={toast.id} variant={toast.variant}>
            <span className={styles.text}>{toast.message}</span>
          </Toast>
        </li>
      ))}
    </ol>
  );
};
