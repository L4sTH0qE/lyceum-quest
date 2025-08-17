export type SelectProps = {
  data: Array<{ id: string; title: string; avatar?: string }>;
  label?: string;
  placeholder: string;
  initialValue?: string;
  onSelect: (id: string) => void;
  dropdownKey?: string;
};
