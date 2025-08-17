import React, { useState, useEffect } from "react";
import styles from "./styles.module.css";
import { QuestTask } from "../../questTask";
import { TextTaskData } from "@/pages/createQuest/types/types";

type TextTaskProps = {
  taskData: TextTaskData;
  taskId: string;
  allTaskIds: string[];
  updateData: (newData: TextTaskData) => void;
  onDelete: () => void;
};

export const TextTask: React.FC<TextTaskProps> = ({
  taskData,
  taskId,
  allTaskIds,
  updateData,
  onDelete,
}) => {
  const [number] = useState(taskData.number || "1");
  const [firstField, setFirstField] = useState(taskData.firstField || "");
  const [secondField, setSecondField] = useState(taskData.secondField || "");

  useEffect(() => {
    if (
      number !== taskData.number ||
      firstField !== taskData.firstField ||
      secondField !== taskData.secondField
    ) {
      updateData({ number, firstField, secondField, taskId });
    }
  }, [number, firstField, secondField, taskId, taskData, updateData]);

  useEffect(() => {
    if (!allTaskIds.includes(secondField) || secondField === taskId) {
      setSecondField("");
    }
  }, [allTaskIds, secondField, taskId]);
  return (
    <QuestTask
      verticalText={"Текст"}
      taskId={taskId}
      allTaskIds={allTaskIds}
      secondField={secondField}
      setSecondField={setSecondField}
      onDelete={onDelete}
    >
      <div className={styles.fieldWrapper}>
        <div className={styles.label}>Текст</div>
        <input
          className={styles.input}
          placeholder="Заполните поле"
          value={firstField}
          onChange={(e) => setFirstField(e.target.value)}
        />
      </div>
    </QuestTask>
  );
};
