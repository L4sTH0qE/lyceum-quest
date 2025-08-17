import { useContext } from "react";
import { ModalContext } from "../model";
import { ModalContextType } from "../lib/types";

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
