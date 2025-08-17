import { FC, FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loading } from "@/shared/ui/Loading";
import { Error } from "@/shared/ui/Error";
import { useUpdatePassword } from "@/shared/api/useCustomQuery";
import styles from "./styles.module.css";
import { Input } from "@/shared/ui/Input";
import { Button } from "@/shared/ui/Button";
import { useToast } from "@/features/useToast";

export const UpdatePassword: FC = () => {
  const { createToast } = useToast();
  const [passwordOne, setPasswordOne] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const navigate = useNavigate();

  const { mutate, isPending, isError } = useUpdatePassword();

  const handleChangePassword = (event: FormEvent) => {
    event.preventDefault();

    if (passwordOne !== passwordRepeat) {
      createToast("Пароли не совпадают", "error");
      return;
    }

    const dataToSend = {
      new_password: passwordOne,
      new_password_again: passwordRepeat,
    };

    mutate(dataToSend, {
      onSuccess: () => {
        createToast("Пароль изменен", "success");
        navigate("/settings");
      },
      onError: () => {
        createToast("Ошибка при смене пароля", "error");
      },
    });
  };

  if (isError) return <Error />;

  return (
    <>
      {isPending && <Loading />}
      <form className={styles.form} onSubmit={handleChangePassword}>
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
            Изменить
          </Button>
        </div>
      </form>
    </>
  );
};
