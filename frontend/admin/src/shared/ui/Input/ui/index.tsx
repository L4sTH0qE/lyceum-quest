import { FunctionComponent, useState, useEffect } from "react";
import styles from "./styles.module.css";
import { InputProps } from "../lib/types";
import {
  validateTextInput,
  validatePasswordInput,
  validateEmailInput,
} from "../lib/validation";
import classNames from "classnames";

export const Input: FunctionComponent<InputProps> = ({
  type,
  placeholder,
  label,
  value,
  disabled = false,
  onChange,
}) => {
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (value.trim() === "") {
      setIsError(false);
      return;
    }

    if (type === "text") {
      setIsError(!validateTextInput(value));
    } else if (type === "password") {
      setIsError(!validatePasswordInput(value));
    } else if (type === "email") {
      setIsError(!validateEmailInput(value));
    }
  }, [value, type]);
  return (
    <div className={styles.inputParent}>
      {label ? (
        <label className={styles.label}>
          <span>{label}</span>
          <div className={styles.inputContainer}>
            <input
              className={classNames(styles.input, { [styles.error]: isError })}
              type={type}
              disabled={disabled}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
            />
          </div>
        </label>
      ) : (
        <div className={styles.inputContainer}>
          <input
            className={classNames(styles.input, { [styles.error]: isError })}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
          />
        </div>
      )}
    </div>
  );
};
