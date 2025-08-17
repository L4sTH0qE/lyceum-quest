import styles from './Keyboard.module.css';
import { ICharacter, IKeyboard, IKeyboardMessage } from '../../utils/interfaces';

interface IKeyboardProps {
    message: IKeyboardMessage;
    handleSend: (
        character: ICharacter,
        message_id: string,
        text: string,
        button_id: string,
    ) => void;
}
const Keyboard = ({ message, handleSend }: IKeyboardProps) => {
    return (
        <>
            <div className={styles.keyboard}>
                <ul className={styles.keyboard_list}>
                    {message.keyboard.map((row: IKeyboard[], key: number) => (
                        <div className={styles.keyboard_row} key={key}>
                            {row.map((option: IKeyboard, key: number) => (
                                <li className={styles.keyboard_listItem} key={key}>
                                    <button
                                        className={styles.keyboard_listItem_button}
                                        onClick={() =>
                                            handleSend(
                                                option.next_message_character,
                                                message.message_id,
                                                option.placeholder ?? option.text,
                                                option.button_id,
                                            )
                                        }
                                    >
                                        {option.text}
                                    </button>
                                </li>
                            ))}
                        </div>
                    ))}
                </ul>
            </div>
        </>
    );
};

export default Keyboard;
