import { useAuth } from "@/app/providers/useAuth/api/AuthContext";
import { useModal } from "@/features/modalOpen/hook";
import { useToast } from "@/features/useToast";
import {
  useCreateCharacterMutation,
  useUpdateCharacterMutation,
} from "@/shared/api/useCustomQuery";
import { Button } from "@/shared/ui/Button";
import { FileInput } from "@/shared/ui/FileInput";
import { Input } from "@/shared/ui/Input";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { FunctionComponent, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Modal } from "../../Modal";
import styles from "./styles.module.css";

export const CharacterModal: FunctionComponent = () => {
  const queryClient = useQueryClient();
  const { createToast } = useToast();
  const { isModalOpen, closeModal, modalData } = useModal();
  const { token } = useAuth();
  const [name, setName] = useState<string>("");
  const [avatarFileName, setAvatarFileName] = useState<string | null>(null);
  const [fullSizeImageFileName, setFullSizeImageFileName] = useState<
    string | null
  >(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullSizeImageUrl, setFullSizeImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { mutate } = useCreateCharacterMutation();
  const { mutate: updateCharacter } = useUpdateCharacterMutation();

  useEffect(() => {
    if (modalData) {
      setName(modalData.name || "");
      setAvatarUrl(modalData.avatar);
      setAvatarFileName(modalData.avatar);
      setFullSizeImageUrl(modalData.full_size_image);
      setFullSizeImageFileName(modalData.full_size_image);
    }
  }, [modalData]);

  const uploadFile = async (file: File, type: "avatar" | "full_size_image") => {
    const BASE_URL = "https://api.darkony.ru";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "image");
    formData.append("file_name", file.name.replace(/\\/g, "/"));

    try {
      setLoading(true);
      const response = await axios.post(
        `${BASE_URL}/api/v1/admin/upload-file`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const fileUrl = response.data.url;

      if (type === "avatar") {
        setAvatarUrl(fileUrl);
        setAvatarFileName(file.name);
      } else if (type === "full_size_image") {
        setFullSizeImageUrl(fileUrl);
        setFullSizeImageFileName(file.name);
      }
    } catch (error) {
      createToast("Ошибка при загрузке файла.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!avatarUrl || !fullSizeImageUrl) {
      createToast("Пожалуйста, загрузите все изображения.", "warning");
      return;
    }

    if (modalData) {
      const characterData = {
        id: modalData.id,
        name,
        avatar: avatarUrl,
        full_size_image: fullSizeImageUrl,
      };
      updateCharacter(characterData, {
        onSuccess: () => {
          createToast("Данные успешно отредактированы", "success");
          queryClient.invalidateQueries({ queryKey: ["characters"] });
          closeModal();
        },
        onError: () => {
          createToast("Ошибка при редактировании", "warning");
        },
      });
    } else {
      const characterData = {
        name,
        avatar: avatarUrl,
        full_size_image: fullSizeImageUrl,
      };
      mutate(characterData, {
        onSuccess: () => {
          closeModal();
          createToast("Персонаж создан", "success");
          queryClient.invalidateQueries({ queryKey: [`characters`] });
        },
        onError: () => {
          createToast("Ошибка при создании персонажа.", "warning");
        },
      });
    }
  };

  if (!isModalOpen) return null;

  return ReactDOM.createPortal(
    <Modal
      text={`${modalData ? "Редактировать" : "Добавить"} персонажа`}
      closeModal={closeModal}
    >
      <form onSubmit={handleSubmit} className={styles.formBody}>
        <div className={styles.modalBody}>
          <Input
            type="text"
            placeholder="Имя персонажа"
            label="Имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
          <FileInput
            label="Аватар"
            fileName={avatarFileName}
            disabled={loading}
            onChange={(e) =>
              e.target.files && uploadFile(e.target.files[0], "avatar")
            }
          />
          <FileInput
            label="Полноразмерное изображение"
            fileName={fullSizeImageFileName}
            disabled={loading}
            onChange={(e) =>
              e.target.files && uploadFile(e.target.files[0], "full_size_image")
            }
          />
        </div>
        <div className={styles.buttonContainer}>
          <Button className={"createButton"} type="submit">
            Сохранить
          </Button>
          <Button className={"editButton"} onClick={closeModal}>
            Отменить
          </Button>
        </div>
      </form>
    </Modal>,
    document.body
  );
};
