import { FunctionComponent } from "react";
import styles from "./styles.module.css";
import { Button } from "@/shared/ui/Button";
import { CardGrid } from "@/shared/ui/CardGrid";
import { useCustomGetQuery } from "@/shared/api/useCustomQuery";
import { Loading } from "@/shared/ui/Loading";
import { Error } from "@/shared/ui/Error";
import { useModal } from "@/features/modalOpen/hook";
import { CharacterTypes } from "@/shared/api/types/types";

export const Characters: FunctionComponent = () => {
  const { data, error, isLoading } = useCustomGetQuery<CharacterTypes[]>({
    query: "characters",
  });

  const { openModal } = useModal();

  if (error) return <Error />;

  return (
    <>
      <div className={styles.head}>
        <span className={styles.title}>Персонажи</span>
        <Button
          size="md"
          variant="primary"
          onClick={() => openModal("", "character")}
        >
          Создать
        </Button>
      </div>
      {isLoading && <Loading />}
      <div className={styles.faderScroll}>
        {data &&
          data.map((el) => (
            <CardGrid
              type="Character"
              key={el.id}
              template={el}
              modalType="character"
            />
          ))}
      </div>
    </>
  );
};
