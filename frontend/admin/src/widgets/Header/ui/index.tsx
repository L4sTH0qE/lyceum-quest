import { useAuth } from "@/app/providers/useAuth/api/AuthContext";
import { useToast } from "@/features/useToast";
import { useLogoutMutation } from "@/shared/api/useCustomQuery";
import { Button } from "@/shared/ui/Button";
import { FunctionComponent } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

export const Header: FunctionComponent = () => {
  const { setToken, token, setId, setStatus } = useAuth();
  const navigate = useNavigate();
  const { createToast } = useToast();

  const { mutate } = useLogoutMutation();

  const handleLogout = () => {
    mutate(undefined, {
      onSuccess: () => {
        setToken(null);
        setId(null);
        setStatus(null);
        localStorage.removeItem("token");
        localStorage.removeItem("id");
        localStorage.removeItem("status");
        navigate("/login");
        createToast("Будем ждать вас обратно!", "success");
      },
      onError: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("id");
        localStorage.removeItem("status");
        navigate("/login");
        createToast("Кажется, будто вас раньше с нами не было", "notice");
      },
    });
  };
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to="/">
          <img src="/admin/images/logo.svg" className={styles.header_logo} />
        </Link>

        {token && (
          <div>
            <Button
              onClick={handleLogout}
              size="sm"
              variant="secondary"
              // status="hover"
              icon="logout"
              // className="buttonLogOut"
            />
          </div>
        )}
      </div>
    </div>
  );
};
