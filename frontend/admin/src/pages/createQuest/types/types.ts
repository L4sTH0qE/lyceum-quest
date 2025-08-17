export type TextTaskData = {
  taskId: string;
  number: string;
  firstField: string;
  secondField: string;
};

export type ActionCardProps = {
  taskData: ActionCardData;
  taskId: string;
  allTaskIds: string[];
  updateData: (newData: ActionCardData) => void;
  onDelete: () => void;
};

export type ActionCardData = {
  taskId: string;
  id: string;
  number: string;
  title: string;
  description: string;
  imageUrl: string;
  buttons: ButtonField[];
  attachmentId?: string;
};

export type ButtonField = {
  buttonText: string;
  buttonContent: string;
  buttonType: "url" | "nextStep";
  pairId: string;
};

export type FieldPair = {
  firstField: string;
  secondField: string;
  nextStep: string;
  pairId: string;
};

export type ButtonTaskData = {
  number: string;
  fieldPairs: FieldPair[][];
};

export type SelectorTaskData = {
  number: string;
  firstField: string;
  secondField: string;
};

export type FileTaskData = {
  taskId: string;
  number: string;
  files: Array<{
    url: string;
    name: string;
    type: string;
  }>;
  secondField?: string;
  attachmentIds: string[];
};

export type TaskData =
  | TextTaskData
  | FileTaskData
  | SelectorTaskData
  | ButtonTaskData
  | ActionCardData;

export type Task = {
  id: string;
  type: string;
  data: TaskData;
  taskKey: string;
};

export type MessageData = {
  id: string;
  order_id: string;
  is_first: boolean;
  quest_task_type_id: string;
  data:
    | { text: string; next_task_id: string }
    | { next_task_id: string; attachment_id?: string[] }
    | { has_lyceum_next_id: string; no_lyceum_next_id: string }
    | {
        keyboard: Array<
          Array<{
            button_id: string;
            text: string;
            placeholder: string;
            next_task_id: string;
          }>
        >;
      }
    | {
        title: string;
        text: string;
        action_button: { action_url: string; placeholder: string };
        next_task_button: { placeholder: string };
        next_task_id: string;
        attachment_id?: string[];
      };
  character_id?: string;
  author: string;
  attachments?: Array<{
    id: string;
    url: string;
    name: string;
    type: string;
  }>;
  attachment_id?: string[];
};

export interface QuestData {
  name: string;
  is_available: boolean;
  messages: MessageData[];
}
