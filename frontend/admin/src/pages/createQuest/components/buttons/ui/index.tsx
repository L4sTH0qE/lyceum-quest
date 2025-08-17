import React, { useState, useEffect } from "react";
import styles from "./styles.module.css";
import { Icon } from "@/shared/ui/Icon";
import { QuestTask } from "../../questTask";
import { ButtonTaskData, FieldPair } from "@/pages/createQuest/types/types";

export type ButtonTaskProps = {
  taskData: ButtonTaskData;
  taskId: string;
  allTaskIds: string[];
  updateData: (newData: ButtonTaskData) => void;
  onDelete: () => void;
};

export const ButtonTask: React.FC<ButtonTaskProps> = ({
  taskData,
  taskId,
  allTaskIds,
  updateData,
  onDelete,
}) => {
  // Правильная инициализация с проверкой на наличие массива массивов
  const [fieldPairs, setFieldPairs] = useState<FieldPair[][]>(
    Array.isArray(taskData.fieldPairs) && Array.isArray(taskData.fieldPairs[0])
      ? taskData.fieldPairs
      : [
          [
            {
              firstField: "",
              secondField: "",
              nextStep: "",
              pairId: crypto.randomUUID(),
            },
          ],
        ]
  );

  console.log("fieldPairs", fieldPairs);
  useEffect(() => {
    if (JSON.stringify(fieldPairs) !== JSON.stringify(taskData.fieldPairs)) {
      updateData({ ...taskData, fieldPairs });
    }
  }, [fieldPairs, taskData, updateData]);

  const handleAddPair = () => {
    setFieldPairs((prevFieldPairs) => {
      const lastGroup = prevFieldPairs[prevFieldPairs.length - 1];
      if (lastGroup.length >= 3) {
        return [
          ...prevFieldPairs,
          [
            {
              firstField: "",
              secondField: "",
              nextStep: "",
              pairId: crypto.randomUUID(),
            },
          ],
        ];
      } else {
        return prevFieldPairs.map((group, index) =>
          index === prevFieldPairs.length - 1
            ? [
                ...group,
                {
                  firstField: "",
                  secondField: "",
                  nextStep: "",
                  pairId: crypto.randomUUID(),
                },
              ]
            : group
        );
      }
    });
  };

  const handleFieldChange = (
    groupIndex: number,
    index: number,
    fieldName: keyof FieldPair,
    value: string
  ) => {
    setFieldPairs((prevFieldPairs) =>
      prevFieldPairs.map((group, gIndex) =>
        gIndex === groupIndex
          ? group.map((pair, i) =>
              i === index ? { ...pair, [fieldName]: value } : pair
            )
          : group
      )
    );
  };

  const handleRemovePair = (groupIndex: number, pairId: string) => {
    setFieldPairs(
      (prevFieldPairs) =>
        prevFieldPairs
          .map((group, gIndex) =>
            gIndex === groupIndex
              ? group.filter((pair) => pair.pairId !== pairId)
              : group
          )
          .filter((group) => group.length > 0) // Удаление пустых групп
    );
  };

  return (
    <QuestTask
      taskId={taskId}
      allTaskIds={allTaskIds}
      secondField=""
      setSecondField={() => {}}
      onDelete={onDelete}
      verticalText="Кнопки"
    >
      <div className={styles.table}>
        {fieldPairs.map((group, groupIndex) => (
          <div key={groupIndex} className={styles.groupContainer}>
            {group.map((pair, index) => (
              <div key={pair.pairId} className={styles.fieldGroupRow}>
                <div className={styles.fieldGroupInner}>
                  <div className={styles.label}>Текст кнопки</div>
                  <input
                    className={styles.inputTextInButton}
                    placeholder="Введите текст кнопки"
                    value={pair.firstField}
                    onChange={(e) =>
                      handleFieldChange(
                        groupIndex,
                        index,
                        "firstField",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className={styles.fieldGroupInner}>
                  <div className={styles.label}>Подсказка</div>
                  <input
                    className={styles.inputTextInButton}
                    placeholder="Введите подсказку"
                    value={pair.secondField}
                    onChange={(e) =>
                      handleFieldChange(
                        groupIndex,
                        index,
                        "secondField",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className={styles.fieldWrapper}>
                  <div className={styles.label}>Следующий шаг</div>
                  <select
                    className={styles.input}
                    value={pair.nextStep}
                    onChange={(e) =>
                      handleFieldChange(
                        groupIndex,
                        index,
                        "nextStep",
                        e.target.value
                      )
                    }
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
                <div onClick={() => handleRemovePair(groupIndex, pair.pairId)}>
                  <Icon size="lg" type="delete" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className={styles.separatorWrapper}>
        <div className={styles.separator}></div>
        <button className={styles.addButton} onClick={handleAddPair}>
          <span>+</span>
        </button>
      </div>
    </QuestTask>
  );
};
