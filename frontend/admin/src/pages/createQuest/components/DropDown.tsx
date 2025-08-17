import { FunctionComponent } from "react";
import styles from "./styles.module.css";
import { useSelect } from "@/shared/ui/Select/model/useSelect";

export type DropdownMenuProps = {
  data: Array<{ id: string; title: string }>;
  onSelect: (id: string) => void;
  dropdownKey: string;
};

export const DropdownMenu: FunctionComponent<DropdownMenuProps> = ({
  data,
  onSelect,
  dropdownKey,
}) => {
  const { isOpen, toggleDropdown, handleSelect } = useSelect(
    undefined,
    dropdownKey
  );

  return (
    <>
      <button className={styles.addButton} onClick={toggleDropdown}>
        <span>+</span>
      </button>
      {isOpen && (
        <div className={styles.dropdown} role="listbox">
          <div className={styles.dropdownContainer}>
            {data.map(({ id, title }) => (
              <div
                key={id}
                className={styles.dropdownItem}
                onClick={() => handleSelect(id, onSelect)}
                role="option"
              >
                {title}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
