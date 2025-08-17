import styles from "./styles.module.css";
export const Loading = () => {
  return (
    <div className={styles.container}>
      <div>
        <img
          src="/admin/images/darkon.gif"
          alt="Loading..."
          className={styles.loader}
        />
      </div>
    </div>
  );
};
