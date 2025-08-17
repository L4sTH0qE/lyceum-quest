import { useState, useEffect, useCallback } from "react";
import styles from "./styles.module.css";
import { Icon } from "@/shared/ui/Icon";
import axios from "axios";
import { useAuth } from "@/app/providers/useAuth/api/AuthContext";
import { DropdownMenu } from "../../DropDown";
import { useToast } from "@/features/useToast";
import { QuestTask } from "../../questTask";
import { ActionCardProps, ButtonField } from "@/pages/createQuest/types/types";
import { Button } from "@/shared/ui/Button";

export const ActionCard = ({
  taskData,
  taskId,
  allTaskIds,
  updateData,
  onDelete,
}: ActionCardProps) => {
  const { token } = useAuth();
  const { createToast } = useToast();
  const [number] = useState(taskData.number || "1");
  const [title, setTitle] = useState(taskData.title || "");
  const [description, setDescription] = useState(taskData.description || "");
  const [imageUrl, setImageUrl] = useState(taskData.imageUrl || "");
  const [attachmentId, setAttachmentId] = useState<string | undefined>(
    taskData.attachmentId
  );
  const [loading, setLoading] = useState(false);
  const [buttonFields, setButtonFields] = useState<ButtonField[]>(
    taskData.buttons || []
  );

  const handleUpdateData = useCallback(() => {
    const hasChanges =
      number !== taskData.number ||
      title !== taskData.title ||
      description !== taskData.description ||
      imageUrl !== taskData.imageUrl ||
      JSON.stringify(buttonFields) !== JSON.stringify(taskData.buttons);

    if (hasChanges) {
      updateData({
        taskId: taskId,
        id: taskData.id,
        number,
        title,
        description,
        imageUrl,
        attachmentId,
        buttons: buttonFields,
      });
    }
  }, [
    taskId,
    number,
    title,
    description,
    imageUrl,
    buttonFields,
    taskData,
    updateData,
    attachmentId,
  ]);

  useEffect(() => {
    setTitle(taskData.title || "");
    setDescription(taskData.description || "");
    setImageUrl(taskData.imageUrl || "");
    setAttachmentId(taskData.attachmentId);
    setButtonFields(taskData.buttons || []);
  }, [taskData]);

  useEffect(() => {
    handleUpdateData();
  }, [number, title, description, imageUrl, buttonFields, handleUpdateData]);

  useEffect(() => {
    const updatedButtonFields = buttonFields.map((field) =>
      field.buttonType === "nextStep" && field.buttonContent === taskId
        ? { ...field, buttonContent: "" }
        : field
    );
    if (JSON.stringify(updatedButtonFields) !== JSON.stringify(buttonFields)) {
      setButtonFields(updatedButtonFields);
    }
  }, [buttonFields, taskId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      createToast("Файл должен быть изображением.", "warning");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "image");
      formData.append("file_name", file.name.replace(/\\/g, "/"));

      const response = await axios.post(
        "https://api.darkony.ru/api/v1/admin/upload-file",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const fileUrl = response.data.url;
      const fileId = response.data.id;
      setImageUrl(fileUrl);
      setAttachmentId(fileId);
    } catch (error) {
      createToast("Ошибка при загрузке изображения", "error");
    } finally {
      createToast("Файл успешно загружен", "success");
      setLoading(false);
    }
  };

  const availableButtonTypes = [
    { id: "1", title: "Ссылка", type: "url" },
    { id: "2", title: "След. шаг", type: "nextStep" },
  ].filter((buttonType) =>
    buttonFields.every((field) => field.buttonType !== buttonType.type)
  );

  const handleSelect = (id: string) => {
    if (id === "1") {
      handleAddButtonField("url");
    } else if (id === "2") {
      handleAddButtonField("nextStep");
    }
  };

  const handleAddButtonField = (type: "url" | "nextStep") => {
    const alreadyExists = buttonFields.some(
      (field) => field.buttonType === type
    );

    if (!alreadyExists && buttonFields.length < 2) {
      setButtonFields((prevFields) => [
        ...prevFields,
        {
          buttonText: "",
          buttonContent: "",
          buttonType: type,
          pairId: crypto.randomUUID(),
        },
      ]);
    } else {
      createToast(
        `Нельзя добавить более одной кнопки с типом "${
          type === "url" ? "Ссылка" : "Следующий шаг"
        }".`,
        "warning"
      );
    }
  };

  const handleRemoveButtonField = (pairId: string) => {
    setButtonFields((prevFields) =>
      prevFields.filter((field) => field.pairId !== pairId)
    );
  };

  const handleButtonFieldChange = (
    index: number,
    fieldName: keyof ButtonField,
    value: string
  ) => {
    const updatedFields = buttonFields.map((field, i) =>
      i === index ? { ...field, [fieldName]: value } : field
    );
    setButtonFields(updatedFields);
  };

  return (
    <QuestTask
      taskId={taskId}
      allTaskIds={allTaskIds}
      secondField=""
      setSecondField={() => {}}
      onDelete={onDelete}
      verticalText="Action Card"
    >
      <div className={styles.card}>
        <div className={styles.imageContainer}>
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Загруженное изображение"
              className={styles.cardImage}
            />
          )}
          <input
            type="file"
            className={styles.fileInput}
            onChange={handleFileChange}
            disabled={loading}
          />
          <div className={styles.overlayIcon}>
            <Icon type="add" size="lg" />
          </div>
        </div>
        <div className={styles.cardContent}>
          <input
            type="text"
            className={styles.cardTitleInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Введите заголовок"
          />
          <textarea
            rows={1}
            className={styles.cardDescriptionInput}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Введите описание"
          />
        </div>
        <div className={styles.cardActions}>
          <div className={styles.buttonsActions}>
            {buttonFields.map((field, index) => (
              <div key={field.pairId} className={styles.buttonsActionsWrapper}>
                <div className={styles.buttonContainer}>
                  <div className={styles.label}>Текст кнопки</div>
                  <input
                    type="text"
                    className={styles.inputTextInButton}
                    value={field.buttonText}
                    onChange={(e) =>
                      handleButtonFieldChange(
                        index,
                        "buttonText",
                        e.target.value
                      )
                    }
                    placeholder="Пиши прямо тут"
                  />
                </div>
                <div className={styles.buttonContainer}>
                  <div className={styles.label}>
                    {field.buttonType === "url" ? "Ссылка" : "След. шаг"}
                  </div>
                  {field.buttonType === "nextStep" ? (
                    <select
                      className={styles.cardTitleInput}
                      value={field.buttonContent}
                      onChange={(e) =>
                        handleButtonFieldChange(
                          index,
                          "buttonContent",
                          e.target.value
                        )
                      }
                    >
                      <option className={styles.options} value="">
                        Выберите задачу
                      </option>
                      {allTaskIds
                        .filter((id) => id !== taskId)
                        .map((id) => (
                          <option key={id} value={id}>
                            Задача {id}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className={styles.cardTitleInput}
                      value={field.buttonContent}
                      onChange={(e) =>
                        handleButtonFieldChange(
                          index,
                          "buttonContent",
                          e.target.value
                        )
                      }
                      placeholder="Ссылка"
                    />
                  )}
                </div>
                <Button
                  icon="delete"
                  variant="transparent"
                  size="lg"
                  onClick={() => handleRemoveButtonField(field.pairId)}
                />
              </div>
            ))}
          </div>
        </div>
        {buttonFields.length < 2 && availableButtonTypes.length > 0 && (
          <div className={styles.separatorWrapper}>
            <div className={styles.separator}></div>
            <DropdownMenu
              data={availableButtonTypes.map((btn) => ({
                id: btn.id,
                title: btn.title,
              }))}
              onSelect={handleSelect}
              dropdownKey="plusDropdownActionCard"
            />
          </div>
        )}
      </div>
    </QuestTask>
  );
};
