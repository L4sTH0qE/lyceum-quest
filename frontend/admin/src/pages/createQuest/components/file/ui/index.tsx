import React, { useState, useEffect, useCallback } from "react";
import styles from "./styles.module.css";
import { Icon } from "@/shared/ui/Icon";
import axios from "axios";
import { useAuth } from "@/app/providers/useAuth/api/AuthContext";
import { useToast } from "@/features/useToast";
import { QuestTask } from "../../questTask";
import { FileTaskData } from "@/pages/createQuest/types/types";

type FileTaskProps = {
  taskData: FileTaskData;
  taskId: string;
  allTaskIds: string[];
  updateData: (newData: FileTaskData) => void;
  onDelete: () => void;
  fileType: "image" | "file" | "video";
};

export const FileTask: React.FC<FileTaskProps> = ({
  taskData,
  taskId,
  allTaskIds,
  updateData,
  onDelete,
  fileType,
}) => {
  const { token } = useAuth();
  const [files, setFiles] = useState(taskData.files || []);
  const [loading, setLoading] = useState(false);
  const [attachmentIds, setAttachmentIds] = useState<string[]>(
    taskData.attachmentIds || []
  );
  const [secondField, setSecondField] = useState(taskData.secondField || "");

  const { createToast } = useToast();

  useEffect(() => {
    if (secondField === taskId) {
      setSecondField("");
    }
  }, [secondField, taskId]);

  const handleUpdateData = useCallback(() => {
    if (
      JSON.stringify(files) !== JSON.stringify(taskData.files) ||
      JSON.stringify(attachmentIds) !==
        JSON.stringify(taskData.attachmentIds) ||
      secondField !== taskData.secondField
    ) {
      updateData({
        taskId,
        number: taskData.number,
        files,
        secondField,
        attachmentIds,
      });
    }
  }, [taskId, files, attachmentIds, secondField, taskData, updateData]);

  useEffect(() => {
    handleUpdateData();
  }, [files, attachmentIds, secondField, handleUpdateData]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (files.length >= 5) {
      createToast("Максимум 5 файлов.", "warning");
      return;
    }

    let type = fileType;

    if (fileType === "image") {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      if (isImage) {
        type = "image";
      } else if (isVideo) {
        type = "video";
      } else {
        createToast("Файл должен быть изображением или видео.", "warning");
        return;
      }
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
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

      const newFile = {
        url: fileUrl,
        name: file.name,
        type: type,
      };

      setFiles((prev) => [...prev, newFile]);
      setAttachmentIds((prevIds) => [...prevIds, fileId]);
    } catch (error) {
      createToast("Ошибка при загрузке файла", "error");
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setAttachmentIds((prevIds) => prevIds.filter((_, i) => i !== index));
  };

  return (
    <QuestTask
      taskId={taskId}
      allTaskIds={allTaskIds}
      secondField={secondField}
      setSecondField={setSecondField}
      onDelete={onDelete}
      verticalText={fileType === "image" ? "Мультимедиа" : "Файл"}
    >
      <div className={styles.filesContainer}>
        {files.map((file, index) => (
          <div key={index} className={styles.fileItem}>
            <img
              src={
                file.type !== "image" ? "/admin/images/sample.jpg" : file.url
              }
              alt={file.name}
              className={styles.filePreview}
            />
            <div
              className={styles.iconDeleteAttachment}
              onClick={() => removeFile(index)}
            >
              <Icon size="sm" type="delete" />
            </div>
          </div>
        ))}
        {files.length < 5 && (
          <div className={styles.fileInputWrapper}>
            <input
              type="file"
              onChange={handleFileChange}
              className={styles.fileInput}
              disabled={loading}
            />
            <Icon type="attachment" size="sm" />
          </div>
        )}
      </div>
    </QuestTask>
  );
};
