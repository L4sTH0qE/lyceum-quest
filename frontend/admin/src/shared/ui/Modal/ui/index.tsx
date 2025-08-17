import { Button } from "../../Button";
import styles from "./styles.module.css";
import { FC, ReactNode } from "react";

interface ModalProps {
  text: string;
  closeModal: () => void;
  children: ReactNode;
}

export const Modal: FC<ModalProps> = ({ text, closeModal, children }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <span className={styles.label}>{text}</span>
          <Button
            onClick={closeModal}
            size="sm"
            variant="secondary"
            icon="close"
          />
        </div>
        {children}
      </div>
    </div>
  );
};
