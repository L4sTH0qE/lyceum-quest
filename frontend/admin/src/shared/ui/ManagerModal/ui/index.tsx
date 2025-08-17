import { FunctionComponent, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import styles from "./styles.module.css";
import { Button } from "@/shared/ui/Button";
import { useModal } from "@/features/modalOpen/hook";
import { Input } from "@/shared/ui/Input";
import { useQueryClient } from "@tanstack/react-query";
import { Select } from "../../Select";
import { useToast } from "@/features/useToast";
import {
  useCreateManager,
  useUpdateManager,
} from "@/shared/api/useCustomQuery";
import { Role, Status } from "@/shared/api/types/types";
import { Modal } from "../../Modal";

export const ManagerModal: FunctionComponent = () => {
  const { createToast } = useToast();
  const { isModalOpen, closeModal, modalData } = useModal();
  const { mutate: createManager } = useCreateManager();
  const { mutate: updateManager } = useUpdateManager();
  const queryClient = useQueryClient();
  const rolesList = queryClient.getQueryData<Role[]>(["user-get-roles"]);

  const statusesList = queryClient.getQueryData<Status[]>([
    "user-get-statuses",
  ]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    lastName: "",
    firstName: "",
    role: "",
    status: "",
  });

  useEffect(() => {
    if (modalData) {
      setFormData({
        email: modalData.login || "",
        password: modalData.password || "",
        lastName: modalData.second_name || "",
        firstName: modalData.first_name || "",
        role: modalData.role_id || "",
        status: modalData.status_id || "",
      });
    }
  }, [modalData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (modalData) {
      const dataToSend = {
        id: modalData.id,
        role_id: formData.role || "",
        status_id: formData.status || "",
      };

      updateManager(dataToSend, {
        onSuccess: () => {
          createToast("Данные успешно отредактированы", "success");
          queryClient.invalidateQueries({ queryKey: ["managers"] });
          closeModal();
        },
        onError: () => {
          createToast(
            "Ошибка при редактировании менеджера менеджера.",
            "warning"
          );
        },
      });
    } else {
      const dataToSend = {
        login: formData.email,
        password: formData.password,
        second_name: formData.lastName,
        first_name: formData.firstName,
        role_id: formData.role,
      };
      createManager(dataToSend, {
        onSuccess: () => {
          createToast("Менеджер успешно добавлен", "success");
          queryClient.invalidateQueries({ queryKey: ["managers"] });
          closeModal();
        },
        onError: () => {
          createToast("Ошибка при создании менеджера.", "warning");
        },
      });
    }
  };

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        [field]: e.target.value,
      });
    };

  const handleSelectStatus = (id: string) => {
    setFormData({ ...formData, status: id });
  };

  const handleSelectRole = (id: string) => {
    setFormData({ ...formData, role: id });
  };

  if (!isModalOpen) return null;

  return ReactDOM.createPortal(
    <Modal
      text={`${modalData ? "Редактировать" : "Добавить"} менеджера`}
      closeModal={closeModal}
    >
      <form onSubmit={handleSubmit} className={styles.formBody}>
        <div className={styles.modalBody}>
          {!modalData && (
            <>
              <Input
                type="email"
                placeholder="Email"
                label="Email"
                value={formData.email}
                onChange={handleChange("email")}
              />
              <Input
                type="text"
                placeholder="Имя"
                label="Имя"
                value={formData.firstName}
                onChange={handleChange("firstName")}
              />
              <Input
                type="text"
                placeholder="Фамилия"
                label="Фамилия"
                value={formData.lastName}
                onChange={handleChange("lastName")}
              />
              <Input
                type="password"
                placeholder="Пароль"
                label="Пароль"
                value={formData.password}
                onChange={handleChange("password")}
              />{" "}
            </>
          )}
          <Select
            data={
              rolesList
                ? rolesList.map((role) => ({
                    id: role.id,
                    title: role.title,
                  }))
                : []
            }
            label="Роль"
            placeholder="Выберите роль"
            onSelect={handleSelectRole}
            dropdownKey={"role"}
            initialValue={formData.role}
          />
          {modalData && (
            <Select
              data={
                statusesList
                  ? statusesList.map((status) => ({
                      id: status.id,
                      title: status.title,
                    }))
                  : []
              }
              label="Статус"
              placeholder="Выберите статус"
              onSelect={handleSelectStatus}
              dropdownKey={"status"}
              initialValue={formData.status}
            />
          )}
        </div>
        <div className={styles.buttonContainer}>
          <Button type="submit" size="sm" variant="primary">
            Сохранить
          </Button>
          <Button onClick={closeModal} size="sm" variant="secondary">
            Отменить
          </Button>
        </div>
      </form>
    </Modal>,
    document.body
  );
};
