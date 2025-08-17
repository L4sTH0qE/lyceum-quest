import { putAnalyticsIsRedirected } from '../../utils/api';
import { ICharacter } from '../../utils/interfaces';
import styles from './ActionCard.module.css';

interface IActionCardProps {
    character: ICharacter;
    messageId: string;
    image: string;
    title: string;
    text: string;
    actionButton?: {
        action_url: string;
        placeholder: string;
    };
    nextTaskButton?: {
        placeholder: string;
    };
    handleSendReply: any;
}
const ActionCard = ({
    character,
    messageId,
    image,
    title,
    text,
    actionButton,
    nextTaskButton,
    handleSendReply,
}: IActionCardProps) => {
    console.log(messageId);
    return (
        <div className={styles.wrapper}>
            <img src={image} alt='' className={styles.img} />
            <div className={styles.content_wrapper}>
                <div className={styles.content_text_wrapper}>
                    <span className={styles.title}>{title}</span>
                    <span className={styles.text}>{text}</span>
                </div>
                <div className={styles.buttons}>
                    {actionButton && (
                        <a
                            href={actionButton.action_url}
                            className={styles.button}
                            target='__blank'
                            onClick={() => putAnalyticsIsRedirected()}
                        >
                            {actionButton.placeholder}
                        </a>
                    )}
                    {nextTaskButton && (
                        <a
                            className={styles.button}
                            onClick={() =>
                                handleSendReply(character, messageId, nextTaskButton.placeholder)
                            }
                        >
                            {nextTaskButton.placeholder}
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActionCard;
