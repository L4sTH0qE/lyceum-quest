import { FunctionComponent, ReactNode, createContext, useState } from "react";

export interface DropdownContextProps {
  openDropdown: string | null;
  setOpenDropdown: (dropdown: string | null) => void;
}

export const DropdownContext = createContext<DropdownContextProps | undefined>(
  undefined
);

export const DropdownProvider: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <DropdownContext.Provider value={{ openDropdown, setOpenDropdown }}>
      {children}
    </DropdownContext.Provider>
  );
};
