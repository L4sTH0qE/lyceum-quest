import { FunctionComponent } from "react";
import styles from "./styles.module.css";
import { useParams } from "react-router-dom";

export const Analytics: FunctionComponent = () => {
  const { id } = useParams<{ id: string }>();
  const query = id || "";
  return (
    <>
      <div className={styles.head}>
        <span className={styles.title}>Аналитика</span>
      </div>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.frame}>
            <iframe
              frameBorder={"0"}
              src={`https://datalens.yandex/rou8wh17cn3ce?quest_id=${query}&_embedded=1&_no_controls=1`}
              width="100%"
              height="200px"
            ></iframe>
          </div>
          <div className={styles.frame}>
            <iframe
              frameBorder={"0"}
              src={`https://datalens.yandex/306dw45yveywq?quest_id=${query}&_embedded=1&_no_controls=1`}
              width="100%"
              height="200px"
            ></iframe>
          </div>
          <div className={styles.frame}>
            <iframe
              frameBorder={"0"}
              src={`https://datalens.yandex/khnwkpj6qsle7?quest_id=${query}&_embedded=1&_no_controls=1`}
              width="100%"
              height="200px"
            ></iframe>
          </div>
        </div>
        <div className={styles.tables}>
          <div className={styles.frame}>
            <iframe
              frameBorder={"0"}
              src={`https://datalens.yandex/1y4pb4enoizco?quest_id=${query}&_embedded=1&_no_controls=1`}
              width="100%"
              height="400px"
            ></iframe>
          </div>
          <div className={styles.frame}>
            <iframe
              frameBorder={"0"}
              src={`https://datalens.yandex/ifm9r2b2rf725?quest_id=${query}&_embedded=1&_no_controls=1`}
              width="100%"
              height="400px"
            ></iframe>
          </div>
        </div>
        <div className={styles.wideFrame}>
          <iframe
            src={`https://datalens.yandex/vsydm98o83b8i?quest_id=${query}&_embedded=1&_no_controls=1`}
            width="100%"
            height="300px"
          ></iframe>
        </div>
      </div>
    </>
  );
};
