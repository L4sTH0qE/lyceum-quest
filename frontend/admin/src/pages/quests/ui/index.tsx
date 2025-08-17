import { FunctionComponent } from "react";
import styles from "./styles.module.css";
import { Button } from "@/shared/ui/Button";
import { CardGrid } from "@/shared/ui/CardGrid";
import { Link } from "react-router-dom";
import { Error } from "@/shared/ui/Error";
import { useCustomGetQuery } from "@/shared/api/useCustomQuery";
import { Loading } from "@/shared/ui/Loading";
import { Quest } from "@/shared/api/types/types";

export const Quests: FunctionComponent = () => {
  const { data, error, isLoading } = useCustomGetQuery<Quest[]>({
    query: "quests",
  });

  if (error) return <Error />;

  return (
    <>
      <div className={styles.head}>
        <span className={styles.title}>Квесты</span>
        <Link to="/quests/create">
          <Button size="md" variant="primary">
            Создать
          </Button>
        </Link>
      </div>
      {isLoading && <Loading />}
      <div className={styles.faderScroll}>
        {data &&
          data.map((el) => (
            <CardGrid
              type="Quest"
              key={el.id}
              template={{
                ...el,
                is_available: el.is_available ? "Доступен" : "Недоступен",
              }}
            />
          ))}
      </div>
    </>
  );
};
