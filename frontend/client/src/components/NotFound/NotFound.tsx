import styles from './NotFound.module.css';
const NotFound = () => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <span className={styles.span}>Что-то пошло не так</span>
        <a
          href='https://lyceum.yandex.ru/'
          className={styles.button}
        >
          Перейти на сайт Яндекс Лицея
        </a>
      </div>
    </div>
  );
};

export default NotFound;
