import { useModal } from "@/features/modalOpen/hook";
import { useToast } from "@/features/useToast";
import classNames from "classnames";
import { useNavigate } from "react-router-dom";
import { Button } from "../../Button";
import { useSelect } from "../../Select/model/useSelect";
import { LABELS } from "../constants/constants";
import { CardGridProps } from "../types/types";
import styles from "./styles.module.css";

export const CardGrid: React.FC<CardGridProps> = ({
  type,
  template,
  customClass,
  modalType,
}) => {
  const { createToast } = useToast();

  const options = [
    { id: "1", title: "Изменить" },
    { id: "2", title: "Ссылка" },
    { id: "3", title: "Аналитика" },
  ];
  const { isOpen, toggleDropdown, handleSelect } = useSelect(
    undefined,
    `useKey${template.id}`
  );
  const { openModal } = useModal();
  const navigate = useNavigate();
  const handler = (id: string) => {
    switch (id) {
      case "1":
        navigate(`./edit/${template.id}`);
        break;
      case "2":
        navigator.clipboard.writeText(`https://darkony.ru/chat/${template.id}`);
        createToast("Ссылка на квест скопирована", "success");
        break;
      case "3":
        navigate(`/analytics/${template.id}`);
        break;
      case "4":
        break;

      default:
        break;
    }
  };

  return (
    <div
      className={classNames(
        {
          [styles.questCard]: type === "Quest",
          [styles.managerCard]: type === "Manager",
          [styles.characterCard]: type === "Character",
        },
        customClass
      )}
    >
      <div className={styles.cardContent}>
        {template.avatar && (
          <div className={styles.row}>
            <img src={template.avatar} alt="Avatar" />
          </div>
        )}

        {Object.entries(template).map(([key, value]) => {
          if (
            key !== "avatar" &&
            key !== "id" &&
            key !== "full_size_image" &&
            key !== "role_id" &&
            key !== "status_id" &&
            key !== "public_beautiful_name" &&
            key !== "user_id"
          ) {
            return (
              <div className={styles.row} key={key}>
                <span className={styles.titleColumn}>{LABELS[key] || key}</span>
                <span className={styles.description}>{value}</span>
              </div>
            );
          }
          return null;
        })}
      </div>
      {modalType ? (
        <Button
          onClick={() => openModal(template, modalType)}
          size="sm"
          variant="secondary"
          icon="edit"
        />
      ) : (
        <>
          <div className={styles.separatorWrapper}>
            <Button
              size="lg"
              variant="transparent"
              icon="dots"
              onClick={toggleDropdown}
            />
            {isOpen && (
              <div className={styles.dropdown} role="listbox">
                <div className={styles.dropdownContainer}>
                  {options.map(({ id, title }) => (
                    <div
                      key={id}
                      className={styles.dropdownItem}
                      onClick={() => handleSelect(id, handler)}
                      role="option"
                    >
                      {title}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
