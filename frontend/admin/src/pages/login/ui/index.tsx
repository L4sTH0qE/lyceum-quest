import { useAuth } from "@/app/providers/useAuth/api/AuthContext";
import { useToast } from "@/features/useToast";
import { useLoginMutation } from "@/shared/api/useCustomQuery";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Loading } from "@/shared/ui/Loading";
import { Header } from "@/widgets/Header";
import { FC, FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

function getGreeting() {
  const now = new Date();
  const hours = now.getHours();

  if (hours >= 5 && hours < 12) {
    return "Доброе утро";
  } else if (hours >= 12 && hours < 18) {
    return "Добрый день";
  } else if (hours >= 18 && hours < 23) {
    return "Добрый вечер";
  } else {
    return "Доброй ночи";
  }
}

export const Login: FC = () => {
  const { createToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setToken, setId, setStatus } = useAuth();
  const navigate = useNavigate();

  const { mutate, isPending } = useLoginMutation();

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("login", email);
    formData.append("password", password);

    mutate(formData, {
      onSuccess: (data) => {
        setToken(data.token);
        setId(data.user_id);
        setStatus(data.status_id);
        localStorage.setItem("token", data.token);
        localStorage.setItem("id", data.user_id);
        localStorage.setItem("status", data.status_id);
        navigate("/");
        createToast(getGreeting(), "success");
      },
      onError: () => {
        createToast("Неверные логин или пароль", "error");
      },
    });
  };

  return (
    <>
      <Header />
      <div className={styles.container}>
        {isPending ? (
          <Loading />
        ) : (
          <form
            className={styles.form}
            onSubmit={(event) => handleLogin(event)}
          >
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className={styles.buttonsContainer}>
              <Button type="submit" className={"createButton"}>
                Войти
              </Button>

              <Link to="/login/reset-password">
                <span className={styles.text}>Забыл пароль?</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </>
  );
};
