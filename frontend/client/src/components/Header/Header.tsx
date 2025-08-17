import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <a
        href='/'
        className={styles.logo}
      ></a>
    </header>
  );
};

export default Header;
