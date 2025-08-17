import React, { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loading } from "@/shared/ui/Loading";
import { Error } from "@/shared/ui/Error";
import { Header } from "@/widgets/Header";
import styles from "./styles.module.css";
import { Input } from "@/shared/ui/Input";
import { Button } from "@/shared/ui/Button";
import { useAuth } from "@/app/providers/useAuth/api/AuthContext";
import { useToast } from "@/features/useToast";
import { useGetUserId, useResetPassword } from "@/shared/api/useCustomQuery";

export const ChangePassword: FC = () => {
  const { createToast } = useToast();
  const [passwordOne, setPasswordOne] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [email, setEmail] = useState("");
  const [localId, setLocalId] = useState<string | null>(null);
  const { id } = useAuth();
  const navigate = useNavigate();

  const {
    mutate: getUserId,
    isPending: isGetIdPending,
    isError: isGetIdError,
  } = useGetUserId();

  const {
    mutate: resetPassword,
    isPending: isResetPending,
    isError: isResetError,
  } = useResetPassword();

  const currentId = id || localId;

  const handleGetUserId = (event: React.FormEvent) => {
    event.preventDefault();
    getUserId(email, {
      onSuccess: (data) => {
        createToast("Пользователь найден", "success");
        setLocalId(data.id);
      },
      onError: () => {
        createToast("Такого пользователя нет", "success");
      },
    });
  };

  const handleChangePassword = (event: React.FormEvent) => {
    event.preventDefault();

    if (passwordOne !== passwordRepeat) {
      createToast("Пароли не совпадают", "warning");
      return;
    }

    const dataToSend = {
      id: currentId,
      new_password: passwordOne,
      new_password_again: passwordRepeat,
    };

    resetPassword(dataToSend, {
      onSuccess: () => {
        createToast("Пароль изменен", "success");
        navigate("/login");
      },
      onError: () => {
        createToast("Что-то пошло не так", "warning");
        navigate("/login");
      },
    });
  };

  if (isGetIdError || isResetError) return <Error />;

  return (
    <>
      <Header />
      <div className={styles.container}>
        {isGetIdPending || isResetPending ? (
          <Loading />
        ) : (
          <form
            className={styles.form}
            onSubmit={currentId ? handleChangePassword : handleGetUserId}
          >
            {!currentId ? (
              <>
                <Input
                  type="email"
                  placeholder="Введите вашу почту"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className={styles.buttonsContainer}>
                  <Button type="submit" className={"createButton"}>
                    Получить ID
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Input
                  type="password"
                  placeholder="Новый пароль"
                  value={passwordOne}
                  onChange={(e) => setPasswordOne(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Повторите новый пароль"
                  value={passwordRepeat}
                  onChange={(e) => setPasswordRepeat(e.target.value)}
                />
                <div className={styles.buttonsContainer}>
                  <Button type="submit" className={"createButton"}>
                    Изменить пароль
                  </Button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </>
  );
};
