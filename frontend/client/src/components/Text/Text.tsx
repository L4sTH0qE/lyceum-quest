import styles from './Text.module.css';

interface ITextProps {
    text: string;
}
export const Text = ({ text }: ITextProps) => (
    <span className={styles.text} dangerouslySetInnerHTML={{ __html: text }}></span>
);
