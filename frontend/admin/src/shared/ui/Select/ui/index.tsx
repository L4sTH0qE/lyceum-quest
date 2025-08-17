import { FunctionComponent } from "react";
import styles from "./styles.module.css";
import { useSelect } from "../model/useSelect";
import { SelectProps } from "../types/types";

export const Select: FunctionComponent<SelectProps> = ({
  data,
  label,
  placeholder,
  initialValue,
  onSelect,
  dropdownKey,
}) => {
  const { isOpen, selectedKey, toggleDropdown, handleSelect } = useSelect(
    initialValue,
    dropdownKey
  );

  const selectedItem = data.find((item) => item.id === selectedKey);

  return (
    <div className={styles.select}>
      <div className={styles.labelRequired}>
        <div className={styles.label}>{label}</div>
      </div>
      <div
        className={`${styles.input} ${isOpen ? styles.inputActive : ""}`}
        onClick={toggleDropdown}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className={`${styles.value} ${selectedKey && styles.valueActive}`}>
          {selectedItem ? selectedItem.title : placeholder}
        </div>
      </div>
      {isOpen && (
        <div className={styles.dropdown} role="listbox">
          <div className={styles.dropdownContainer}>
            {data.map(({ id, title }) => (
              <div
                key={id}
                className={`${styles.dropdownItem} ${
                  selectedKey === id ? styles.selected : ""
                }`}
                onClick={() => handleSelect(id, onSelect)}
                role="option"
                aria-selected={selectedKey === id}
              >
                {title}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
