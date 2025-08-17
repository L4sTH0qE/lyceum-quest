import { IAttachment } from '../../utils/interfaces';
import styles from './Attachment.module.css';

interface IFileAttachment {
  item: IAttachment;
}
const Attachment = ({ item }: IFileAttachment) => {
  console.log('item', item);
  const { name, extension, size_in_kbytes, url } = item;
  return (
    <a
      href={url}
      className={styles.wrapper}
    >
      <div className={styles.file_icon}>
        <span className={styles.extension}>{extension}</span>
        <span className={styles.download}></span>
      </div>
      <div className={styles.inner_wrapper}>
        <span className={styles.file_name}>{name}</span>
        <span className={styles.file_type}>
          {(size_in_kbytes * 0.001).toFixed(2)}&nbsp;MB
        </span>
      </div>
    </a>
  );
};

export default Attachment;
