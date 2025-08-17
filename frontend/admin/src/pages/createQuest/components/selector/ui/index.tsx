import React, { useState, useEffect } from "react";
import styles from "./styles.module.css";
import { Icon } from "@/shared/ui/Icon";
import { QuestTask } from "../../questTask";
import { SelectorTaskData } from "@/pages/createQuest/types/types";

type SelectorTaskProps = {
  taskData: SelectorTaskData;
  taskId: string;
  allTaskIds: string[];
  updateData: (newData: SelectorTaskData) => void;
  onDelete: () => void;
};

export const SelectorTask: React.FC<SelectorTaskProps> = ({
  taskData,
  taskId,
  allTaskIds,
  updateData,
  onDelete,
}) => {
  const [firstField, setFirstField] = useState(taskData.firstField || "");
  const [secondField, setSecondField] = useState(taskData.secondField || "");

  useEffect(() => {
    if (firstField === taskId) {
      setFirstField("");
    }
    if (secondField === taskId) {
      setSecondField("");
    }
  }, [firstField, secondField, taskId]);

  useEffect(() => {
    if (
      firstField !== taskData.firstField ||
      secondField !== taskData.secondField
    ) {
      updateData({ ...taskData, firstField, secondField });
    }
  }, [firstField, secondField, taskData, updateData]);

  return (
    <QuestTask
      taskId={taskId}
      allTaskIds={allTaskIds}
      secondField={secondField}
      setSecondField={setSecondField}
      onDelete={onDelete}
      verticalText="Город"
    >
      <div className={styles.inputSelector}>
        <div className={styles.actionsField}>
          <div className={styles.messagesSendField}>
            <div className={styles.leftContent}>
              <div className={styles.message}>Напиши свой город</div>
            </div>
          </div>
          <Icon size="sm" type="send" />
        </div>

        <div className={styles.selectorsWrapper}>
          <div className={styles.fieldWrapper}>
            <div className={styles.label}>Следующий шаг (если есть лицей)</div>
            <select
              className={styles.input}
              value={firstField}
              onChange={(e) => setFirstField(e.target.value)}
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
          </div>

          <div className={styles.fieldWrapper}>
            <div className={styles.label}>Следующий шаг (если нет лицея)</div>
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
          </div>
        </div>
      </div>
    </QuestTask>
  );
};
