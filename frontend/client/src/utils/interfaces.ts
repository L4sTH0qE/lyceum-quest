export type Author = 'bot' | 'user';
type MessageTypes = 'text' | 'attachment' | 'city_input' | 'keyboard' | 'action_card';
export interface IKeyboard {
    button_id: string;
    text: string;
    placeholder: string;
    next_task_id: string;
    next_message_character: ICharacter;
}
export interface ICharacter {
    id: string;
    name: string;
    avatar: string;
    full_size_image?: string;
}
export interface IMessageBase {
    message_id: string;
    character: ICharacter;
    type: MessageTypes;
    author: Author;
}
export interface ITextMessage extends IMessageBase {
    type: 'text';
    text: string;
}
export interface IKeyboardMessage extends IMessageBase {
    type: 'keyboard';
    keyboard: IKeyboard[][];
}
export interface ICityInput extends IMessageBase {
    type: 'city_input';
    has_lyceum_next_message_character: ICharacter;
    no_lyceum_next_message_character: ICharacter;
}
type ActionButton = {
    action_url: string;
    placeholder: string;
};
export interface IActionCard extends IMessageBase {
    type: 'action_card';
    image_url: string;
    title: string;
    text: string;
    action_button?: ActionButton;
    next_task_button?: { placeholder: string };
    next_message_character: ICharacter;
}
export type AnyMessage =
    | ITextMessage
    | IKeyboardMessage
    | ICityInput
    | IActionCard
    | IAttachmentMessage;

type AttachmentType = 'image' | 'video' | 'file';
export interface IAttachment {
    id: string;
    extension: string;
    name: string;
    size_in_kbytes: number;
    url: string;
    type: AttachmentType;
}
export interface IAttachmentMessage extends IMessageBase {
    type: 'attachment';
    attachments: IAttachment[];
}
