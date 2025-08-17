import { FunctionComponent } from "react";
import styles from "./styles.module.css";
import { Button } from "@/shared/ui/Button";
import { CardGrid } from "@/shared/ui/CardGrid";
import classNames from "classnames";
import { useCustomGetQuery } from "@/shared/api/useCustomQuery";
import { Loading } from "@/shared/ui/Loading";
import { Error } from "@/shared/ui/Error";
import { useModal } from "@/features/modalOpen/hook";
import { ManagerType, Role, Status } from "@/shared/api/types/types";

export const Managers: FunctionComponent = () => {
  const {
    data: useLoadingManagers,
    error,
    isLoading,
  } = useCustomGetQuery<ManagerType[]>({ query: "managers" });
  useCustomGetQuery<Role[]>({
    query: "user-get-roles",
  });
  useCustomGetQuery<Status[]>({
    query: "user-get-statuses",
  });

  const { openModal } = useModal();

  if (error) return <Error />;

  return (
    <>
      {/* // <div className={styles.container}> */}
      <div className={styles.head}>
        <span className={styles.title}>Менеджеры</span>
        <Button onClick={() => openModal("", "manager")}>
          <span>Создать</span>
        </Button>
      </div>
      {isLoading && <Loading />}
      <div className={styles.faderScroll}>
        {useLoadingManagers &&
          useLoadingManagers.map((el) => (
            <CardGrid
              type="Manager"
              key={el.id}
              template={el}
              customClass={classNames(styles.customBorder)}
              modalType="manager"
            />
          ))}
      </div>
    </>
  );
};
