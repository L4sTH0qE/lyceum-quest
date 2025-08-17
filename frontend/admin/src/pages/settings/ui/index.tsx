import { FunctionComponent } from "react";
import styles from "./styles.module.css";
import { Link, Outlet, useLocation } from "react-router-dom";

export const Settings: FunctionComponent = () => {
  const location = useLocation();

  return (
    <div className={styles.container}>
      <div className={styles.frameParent}>
        <div className={styles.parent}>
          <Link to="/settings" className={`${styles.div}`}>
            <span
              className={`${styles.title} ${
                location.pathname === "/settings" ||
                location.pathname === "/settings/update-password"
                  ? styles.active
                  : ""
              }`}
            >
              Профиль
            </span>
          </Link>
          {(location.pathname === "/settings" ||
            location.pathname === "/settings/update-password") && (
            <div className={styles.frameChild}> </div>
          )}
        </div>
        <div className={styles.parent}>
          <Link to="/settings/managers">
            <span
              className={`${styles.title} ${
                location.pathname === "/settings/managers" ? styles.active : ""
              }`}
            >
              Менеджеры
            </span>
          </Link>
          {location.pathname === "/settings/managers" && (
            <div className={styles.frameChild}> </div>
          )}
        </div>
      </div>

      <Outlet />
    </div>
  );
};
