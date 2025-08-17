import { useCallback, useEffect, useState } from "react";
import { Button } from "@/shared/ui/Button";
import styles from "./styles.module.css";
import { DropdownMenu } from "../components/DropDown";
import { TextTask } from "../components/text";
import { Reorder } from "framer-motion";
import { FileTask } from "../components/file/ui";
import { SelectorTask } from "../components/selector";
import { ButtonTask } from "../components/buttons";

import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/features/useToast";
import { ActionCard } from "../components/actioncard";
import { useNavigate, useParams } from "react-router-dom";
import {
  useCreateQuest,
  useCustomGetQuery,
  useEditQuest,
} from "@/shared/api/useCustomQuery";
import {
  ActionCardData,
  ButtonTaskData,
  FieldPair,
  FileTaskData,
  MessageData,
  QuestData,
  SelectorTaskData,
  Task,
  TaskData,
  TextTaskData,
} from "../types/types";
import { Select } from "@/shared/ui/Select";
import { CharacterTypes } from "@/shared/api/types/types";

export const CreateQuest = () => {
  const { mutate: editQuest } = useEditQuest(); // Мутатор для редактирования
  const { id } = useParams<{ id: string }>(); // Получение ID для редактирования
  const [questTasks, setQuestTasks] = useState<Task[]>([]);
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const { createToast } = useToast();
  const [taskIdCounter, setTaskIdCounter] = useState(1);
  const { mutate } = useCreateQuest();
  const [character, setCharacter] = useState<string>();

  const { data: questData, isLoading: isQuestLoading } =
    useCustomGetQuery<QuestData>({
      query: `quests/${id}`,
      options: {
        enabled: !!id,
      }, //
    });

  const { data } = useCustomGetQuery<CharacterTypes[]>({
    query: "characters",
  });

  useEffect(() => {
    if (questData) {
      setTitle(questData.name);
      const tasks = questData.messages
        .map((message: MessageData) => {
          let parsedData;

          message.character_id !== undefined &&
            setCharacter(message.character_id);

          try {
            if (typeof message.data === "string") {
              try {
                parsedData = JSON.parse(message.data);
              } catch (e) {
                console.error("Failed to parse task data:", e);
                return null;
              }
            } else {
              parsedData = message.data;
            }
          } catch (e) {
            console.error("Failed to parse task data:", e);
            return null;
          }

          switch (message.quest_task_type_id) {
            case "1": // Text task
              if ("text" in parsedData && "next_task_id" in parsedData) {
                return {
                  id: message.id,
                  taskKey: crypto.randomUUID(),
                  type: "Текст",
                  data: {
                    taskId: message.id,
                    number: message.order_id,
                    firstField: parsedData.text || "",
                    secondField: parsedData.next_task_id || "",
                  } as TextTaskData,
                };
              }
              return null;
            case "2": // Button/keyboard task
              if (
                "keyboard" in parsedData &&
                Array.isArray(parsedData.keyboard)
              ) {
                return {
                  id: message.id,
                  taskKey: crypto.randomUUID(),
                  type: "Кнопки",
                  data: {
                    taskId: message.id,
                    number: message.order_id,
                    // Мы ожидаем массив массивов, поэтому не используем `flat`
                    fieldPairs: parsedData.keyboard.map((group: FieldPair[]) =>
                      group.map((button: any) => ({
                        firstField: button.text || "",
                        secondField: button.placeholder || "",
                        nextStep: button.next_task_id || "",
                        pairId: crypto.randomUUID(),
                      }))
                    ),
                  } as ButtonTaskData,
                };
              }
              return null;

            case "3": // File/attachment task
              if ("next_task_id" in parsedData) {
                return {
                  id: message.id,
                  taskKey: crypto.randomUUID(),
                  type: "Файл",
                  data: {
                    taskId: message.id,
                    number: message.order_id,
                    files:
                      (message?.attachments &&
                        message.attachments.map((attachment: any) => ({
                          url: attachment.url,
                          name: attachment.name,
                          type: attachment.type,
                        }))) ||
                      [],
                    secondField: parsedData.next_task_id || "",
                    attachmentIds:
                      (message?.attachments &&
                        message?.attachments.map(
                          (attachment: any) => attachment.id
                        )) ||
                      [],
                  } as FileTaskData,
                };
              }
              return null;

            case "4": // Selector task (City Input)
              if (
                "has_lyceum_next_id" in parsedData &&
                "no_lyceum_next_id" in parsedData
              ) {
                return {
                  id: message.id,
                  taskKey: crypto.randomUUID(),
                  type: "Город",
                  data: {
                    taskId: message.id,
                    number: message.order_id,
                    firstField: parsedData.has_lyceum_next_id || "",
                    secondField: parsedData.no_lyceum_next_id || "",
                  } as SelectorTaskData,
                };
              }
              return null;

            case "5": // Action Card task
              if ("title" in parsedData && "text" in parsedData) {
                return {
                  id: message.id,
                  taskKey: crypto.randomUUID(),
                  type: "ActionCard",
                  data: {
                    taskId: message.id,
                    id: message.id,
                    number: message.order_id,
                    title: parsedData.title || "",
                    description: parsedData.text || "",
                    imageUrl:
                      (message?.attachments && message?.attachments[0]?.url) ||
                      null,
                    attachmentId:
                      (message?.attachments && message?.attachments[0]?.id) ||
                      [],
                    buttons: [
                      {
                        buttonText: parsedData.action_button?.placeholder || "",
                        buttonContent:
                          parsedData.action_button?.action_url || "",
                        buttonType: "url",
                        pairId: crypto.randomUUID(),
                      },
                      {
                        buttonText:
                          parsedData.next_task_button?.placeholder || "",
                        buttonContent: parsedData.next_task_id || "",
                        buttonType: "nextStep",
                        pairId: crypto.randomUUID(),
                      },
                    ].filter((button) => button.buttonText), // Оставляем только те кнопки, которые заполнены
                  } as ActionCardData,
                };
              }
              return null;

            default:
              return null;
          }
        })
        .filter((task) => task !== null);

      setQuestTasks(tasks);
      setTaskIdCounter(tasks.length + 1);
    }
  }, [questData]);

  const navigate = useNavigate();

  const handleSelect = (id: string) => {
    let newTask: Task = {
      id: taskIdCounter.toString(),
      type: "",
      taskKey: crypto.randomUUID(),
      data: {} as TaskData,
    };

    switch (id) {
      case "1":
        newTask = {
          ...newTask,
          type: "Текст",
          data: {
            taskId: taskIdCounter.toString(),
            number: "1",
            firstField: "",
            secondField: "",
          } as TextTaskData,
        };
        break;
      case "2":
        newTask = {
          ...newTask,
          type: "Файл",
          data: {
            taskId: taskIdCounter.toString(),
            number: "1",
            files: [],
            attachmentIds: [],
            secondField: "",
          } as FileTaskData,
        };
        break;
      case "3":
        newTask = {
          ...newTask,
          type: "Мультимедиа",
          data: {
            taskId: taskIdCounter.toString(),
            number: "1",
            files: [],
            attachmentIds: [],
            secondField: "",
          } as FileTaskData,
        };
        break;
      case "4":
        newTask = {
          ...newTask,
          type: "Город",
          data: {
            taskId: taskIdCounter.toString(),
            number: "1",
            firstField: "",
            secondField: "",
          } as SelectorTaskData,
        };

        break;
      case "5":
        newTask = {
          ...newTask,
          type: "Кнопки",
          data: {
            taskId: taskIdCounter.toString(),
            number: "1",
            fieldPairs: [
              [
                {
                  firstField: "",
                  secondField: "",
                  nextStep: "",
                  pairId: crypto.randomUUID(),
                },
              ],
            ],
          } as ButtonTaskData,
        };
        break;

      case "6":
        newTask = {
          ...newTask,
          type: "ActionCard",
          data: {
            taskId: taskIdCounter.toString(),
            id: "",
            number: "1",
            title: "",
            description: "",
            imageUrl: "",
            buttons: [],
          } as ActionCardData,
        };

        break;
      default:
        break;
    }

    setQuestTasks((prev) => [...prev, newTask]);
    setTaskIdCounter((prevCounter) => prevCounter + 1);
  };

  const handleReorder = (newOrder: Task[]) => {
    setQuestTasks(newOrder);
    setQuestTasks((prevTasks) =>
      prevTasks.map((task, index) => ({
        ...task,
        id: (index + 1).toString(),
      }))
    );
  };
  const removeTask = (taskId: string) => {
    const filteredTasks = questTasks.filter((task) => task.id !== taskId);

    const updatedTasks = filteredTasks.map((task, index) => ({
      ...task,
      id: (index + 1).toString(),
    }));

    setTaskIdCounter(updatedTasks.length + 1);

    setQuestTasks(updatedTasks);
  };

  const updateTaskData = useCallback((index: number, newData: TaskData) => {
    setQuestTasks((prevTasks) =>
      prevTasks.map((task, i) =>
        i === index ? { ...task, data: newData } : task
      )
    );
  }, []);

  const handleSave = () => {
    const messages: MessageData[] = questTasks
      .map((task, index): MessageData | null => {
        const isFirst = index === 0;

        switch (task.type) {
          case "Текст": {
            const taskData = task.data as TextTaskData;

            return {
              id: task.id.toString(),
              order_id: (index + 1).toString(),
              is_first: isFirst,
              quest_task_type_id: "1",
              data: {
                text: taskData.firstField,
                next_task_id: taskData.secondField,
              },
              character_id: character,
              author: "bot",
            };
          }

          case "Файл":
          case "Мультимедиа": {
            const taskData = task.data as FileTaskData;

            return {
              id: task.id.toString(),
              order_id: (index + 1).toString(),
              is_first: isFirst,
              quest_task_type_id: "3",
              attachment_id: taskData.attachmentIds,
              data: {
                next_task_id: taskData.secondField || "",
              },
              character_id: character,
              author: "bot",
            };
          }

          case "Город": {
            const taskData = task.data as SelectorTaskData;

            return {
              id: task.id.toString(),
              order_id: (index + 1).toString(),
              is_first: isFirst,
              quest_task_type_id: "4",
              data: {
                has_lyceum_next_id: taskData.firstField,
                no_lyceum_next_id: taskData.secondField,
              },
              author: "user",
            };
          }

          case "Кнопки": {
            const taskData = task.data as ButtonTaskData;
            let tmp = 1;
            const keyboard = taskData.fieldPairs.map((group) =>
              group.map((pair) => ({
                button_id: (tmp++).toString(),
                text: pair.firstField,
                placeholder: pair.secondField,
                next_task_id: pair.nextStep,
              }))
            );
            return {
              id: task.id.toString(),
              order_id: (index + 1).toString(),
              is_first: isFirst,
              quest_task_type_id: "2",
              data: {
                keyboard: keyboard,
              },
              author: "user",
            };
          }

          case "ActionCard": {
            const taskData = task.data as ActionCardData;

            return {
              id: task.id.toString(),
              order_id: (index + 1).toString(),
              is_first: isFirst,
              quest_task_type_id: "5",
              data: {
                title: taskData.title,
                text: taskData.description,
                action_button: {
                  action_url:
                    taskData.buttons?.find((btn) => btn.buttonType === "url")
                      ?.buttonContent || "",
                  placeholder:
                    taskData.buttons?.find((btn) => btn.buttonType === "url")
                      ?.buttonText || "",
                },
                next_task_button: {
                  placeholder:
                    taskData.buttons?.find(
                      (btn) => btn.buttonType === "nextStep"
                    )?.buttonText || "",
                },
                next_task_id:
                  taskData.buttons?.find((btn) => btn.buttonType === "nextStep")
                    ?.buttonContent || "",
              },
              character_id: character,
              author: "bot",
              attachment_id: taskData.attachmentId
                ? [taskData.attachmentId]
                : [],
            };
          }

          default:
            return null;
        }
      })
      .filter((message): message is MessageData => message !== null);

    const finalQuestData: QuestData = {
      name: title,
      is_available: true,
      messages,
    };

    if (id) {
      editQuest(
        { id, data: finalQuestData },
        {
          onSuccess: () => {
            createToast("Квест сохранен", "success");
            queryClient.invalidateQueries({ queryKey: [`quests`] });
            navigate("/quests/");
          },
          onError: () => {
            createToast("Что-то пошло не так, проверь поля.", "error");
          },
        }
      );
    } else {
      mutate(finalQuestData, {
        onSuccess: () => {
          createToast("Квест сохранен", "success");
          queryClient.invalidateQueries({ queryKey: [`quests`] });
          navigate("/quests/");
        },
        onError: () => {
          createToast("Что-то пошло не так, проверь поля.", "error");
        },
      });
    }
  };

  const renderTask = (task: Task, index: number) => {
    switch (task.type) {
      case "Текст":
        return (
          <TextTask
            key={task.id}
            taskId={task.id}
            allTaskIds={questTasks.map((t) => t.id)}
            taskData={task.data as TextTaskData}
            updateData={(newData: TextTaskData) =>
              updateTaskData(index, newData)
            }
            onDelete={() => removeTask(task.id)}
          />
        );
      case "Файл":
        return (
          <FileTask
            key={task.id}
            taskId={task.id}
            allTaskIds={questTasks.map((t) => t.id)}
            taskData={task.data as FileTaskData}
            updateData={(newData: FileTaskData) =>
              updateTaskData(index, newData)
            }
            onDelete={() => removeTask(task.id)}
            fileType="file"
          />
        );
      case "Мультимедиа":
        return (
          <FileTask
            key={task.id}
            taskId={task.id}
            allTaskIds={questTasks.map((t) => t.id)}
            taskData={task.data as FileTaskData}
            updateData={(newData: FileTaskData) =>
              updateTaskData(index, newData)
            }
            onDelete={() => removeTask(task.id)}
            fileType="image"
          />
        );

      case "Город":
        return (
          <SelectorTask
            key={task.id}
            taskId={task.id}
            allTaskIds={questTasks.map((t) => t.id)}
            taskData={task.data as SelectorTaskData}
            updateData={(newData: SelectorTaskData) =>
              updateTaskData(index, newData)
            }
            onDelete={() => removeTask(task.id)}
          />
        );
      case "Кнопки":
        return (
          <ButtonTask
            key={task.id}
            taskId={task.id}
            allTaskIds={questTasks.map((t) => t.id)}
            taskData={task.data as ButtonTaskData}
            updateData={(newData: ButtonTaskData) =>
              updateTaskData(index, newData)
            }
            onDelete={() => removeTask(task.id)}
          />
        );
      case "ActionCard":
        return (
          <ActionCard
            key={task.id}
            taskId={task.id}
            allTaskIds={questTasks.map((t) => t.id)}
            taskData={task.data as ActionCardData}
            updateData={(newData: ActionCardData) =>
              updateTaskData(index, newData)
            }
            onDelete={() => removeTask(task.id)}
          />
        );
      default:
        return null;
    }
  };

  const handleSelectStatus = (id: string) => {
    setCharacter(id);
  };

  return (
    <>
      <div className={styles.wrapper}>
        {isQuestLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            <div className={styles.head}>
              <input
                type="text"
                className={styles.cardTitleInput}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Введите заголовок"
              />

              <div className={styles.selectWrapper}>
                <Select
                  data={
                    data
                      ? data.map((role) => ({
                          id: role.id,
                          title: role.name,
                          avatar: role.avatar,
                        }))
                      : []
                  }
                  placeholder="Выберите персонажа"
                  onSelect={handleSelectStatus}
                  dropdownKey={"characters"}
                  initialValue={character}
                />
              </div>
            </div>

            <Reorder.Group
              axis="y"
              onReorder={handleReorder}
              values={questTasks}
              className={styles.reorderGroup}
            >
              {questTasks.map((task, index) => (
                <Reorder.Item key={task.taskKey} value={task}>
                  {renderTask(task, index)}
                </Reorder.Item>
              ))}
            </Reorder.Group>
            <div className={styles.body}>
              <div className={styles.separatorWrapper}>
                <div className={styles.separator}></div>
                <DropdownMenu
                  data={[
                    { id: "1", title: "Текст" },
                    { id: "2", title: "Файл" },
                    { id: "3", title: "Мультимедиа" },
                    { id: "4", title: "Город" },
                    { id: "5", title: "Кнопки" },
                    { id: "6", title: "ActionCard" },
                  ]}
                  onSelect={handleSelect}
                  dropdownKey="plusDropdown"
                />
              </div>
            </div>
            <div className={styles.buttonContainer}>
              <Button className="createButton" onClick={handleSave}>
                Сохранить
              </Button>
              <Button onClick={() => navigate("/quests")} variant="secondary">
                Отменить
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
};
