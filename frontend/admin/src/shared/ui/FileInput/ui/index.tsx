import { FunctionComponent } from "react";
import styles from "./styles.module.css";
import { Icon } from "@/shared/ui/Icon";
import { FileInputProps } from "../types/types";

export const FileInput: FunctionComponent<FileInputProps> = ({
  label,
  disabled = false,
  fileName,
  onChange,
}) => {
  return (
    <div className={styles.fileInputParent}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.fileInputContainer}>
        <Icon size="lg" type="add" />
        <input
          type="file"
          disabled={disabled}
          className={styles.fileInput}
          onChange={onChange}
        />
        <div className={styles.fileDisplay}>
          {fileName ? (
            <span className={styles.fileName}>{fileName}</span>
          ) : (
            <span className={styles.placeholder}>Выберите файл</span>
          )}
        </div>
      </div>
    </div>
  );
};
