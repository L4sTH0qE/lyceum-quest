export interface FileInputProps {
  label?: string;
  disabled: boolean;
  fileName: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
