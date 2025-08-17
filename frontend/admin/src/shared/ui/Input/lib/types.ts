import { ChangeEvent } from "react";

export type InputProps = {
  type: "text" | "password" | "email" | "file";
  placeholder: string;
  label?: string;
  value: string;
  disabled?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
};
