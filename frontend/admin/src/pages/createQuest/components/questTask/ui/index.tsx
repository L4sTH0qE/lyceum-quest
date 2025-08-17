import React, { ReactNode } from "react";
import { Icon } from "@/shared/ui/Icon";
import styles from "./styles.module.css";

type QuestTaskProps = {
  taskId: string;
  allTaskIds: string[];
  secondField: string;
  setSecondField: (value: string) => void;
  onDelete: () => void;
  verticalText: string;
  children: ReactNode;
};

export const QuestTask: React.FC<QuestTaskProps> = ({
  taskId,
  allTaskIds,
  secondField,
  setSecondField,
  onDelete,
  verticalText,
  children,
}) => {
  return (
    <div className={styles.taskContainer}>
      <div className={styles.frameParent}>
        <div className={styles.frameWrapper}>
          <div>
            <div className={styles.label}>Шаг</div>
            <span className={styles.staticText}>{taskId}</span>
          </div>
        </div>

        <div className={styles.fieldGroup}>{children}</div>

        <div className={styles.frameDiv}>
          <div className={styles.fieldWrapper}>
            {verticalText !== "Город" &&
              verticalText !== "Action Card" &&
              verticalText !== "Кнопки" && (
                <>
                  <div className={styles.label}>Следующий шаг</div>
                  <select
                    className={styles.input}
                    value={secondField}
                    onChange={(e) => setSecondField(e.target.value)}
                  >
                    <option value="">Выберите задачу</option>
                    {allTaskIds
                      .filter((id) => id !== taskId)
                      .map((id) => (
                        <option key={id} value={id}>
                          Задача {id}
                        </option>
                      ))}
                  </select>
                </>
              )}
          </div>
        </div>
      </div>
      <div className={styles.verticalText}>{verticalText}</div>
      <div className={styles.iconWrapper} onClick={onDelete}>
        <Icon size="lg" type="delete" />
      </div>
    </div>
  );
};
