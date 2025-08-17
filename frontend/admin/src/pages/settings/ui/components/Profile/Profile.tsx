import { useAuth } from "@/app/providers/useAuth/api/AuthContext";
import { useToast } from "@/features/useToast";
import { ManagerType } from "@/shared/api/types/types";
import {
  useCustomGetQuery,
  useUpdateProfile,
} from "@/shared/api/useCustomQuery";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChangeEvent,
  FormEvent,
  FunctionComponent,
  useEffect,
  useState,
} from "react";
import { Link } from "react-router-dom";
import styles from "./styles.module.css";
import { Loading } from "@/shared/ui/Loading";

export const Profile: FunctionComponent = () => {
  const { id } = useAuth();
  const queryClient = useQueryClient();
  const { createToast } = useToast();

  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    email: "",
    password: "****",
    role: "",
  });

  const { data, isLoading } = useCustomGetQuery<ManagerType>({
    query: `managers/${id}`,
  });

  useEffect(() => {
    if (data) {
      setFormData({
        lastName: data.second_name || "",
        firstName: data.first_name || "",
        email: data.login || "",
        password: "****",
        role: data.role_title || "",
      });
    }
  }, [data]);

  const handleChange =
    (field: string) => (e: ChangeEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        [field]: e.target.value,
      });
    };

  const { mutate } = useUpdateProfile();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const dataToSend = {
      new_first_name: formData.firstName,
      new_second_name: formData.lastName,
    };

    mutate(dataToSend, {
      onSuccess: () => {
        createToast("Сохранен", "success");
        queryClient.invalidateQueries({ queryKey: [`managers/${id}`] });
      },
      onError: () => {
        createToast("Не удалось сохранить пароль", "error");
      },
    });
  };

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <div className={styles.inputContainer}>
            <Input
              type="text"
              label="Фамилия"
              placeholder="Введите фамилию"
              value={formData.lastName}
              onChange={handleChange("lastName")}
            />
            <Input
              type="text"
              label="Имя"
              placeholder="Введите имя"
              value={formData.firstName}
              onChange={handleChange("firstName")}
            />
            <Input
              type="email"
              label="Email"
              disabled={true}
              placeholder="Введите email"
              value={formData.email}
              onChange={handleChange("email")}
            />
            <Input
              type="text"
              disabled={true}
              label="Роль"
              placeholder="Введите роль"
              value={formData.role}
              onChange={handleChange("role")}
            />
            <div>
              <Link to="/settings/update-password">
                <span className={styles.href}>Изменить пароль</span>
              </Link>
            </div>
          </div>
          <div className={styles.button}>
            <Button type="submit">Сохранить</Button>
          </div>
        </>
      )}
    </form>
  );
};
