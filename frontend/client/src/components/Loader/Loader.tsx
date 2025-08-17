import styles from './Loader.module.css';
const Loader = () => {
  return (
    <div className={styles.container}>
      <span className={styles.loader}>
        <div className={styles.dotFlashing}></div>
      </span>
    </div>
  );
};

export default Loader;
