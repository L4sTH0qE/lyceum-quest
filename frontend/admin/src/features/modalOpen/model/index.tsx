import { createContext, useState, FunctionComponent, ReactNode } from "react";
import { ModalContextType } from "../lib/types";

export const ModalContext = createContext<ModalContextType | undefined>(
  undefined
);

export const ModalProvider: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [entityType, setEntityType] = useState<string | null>(null);

  const openModal = (data?: any, type?: string) => {
    setModalData(data || null);
    setEntityType(type || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalData(null);
    setEntityType(null);
  };

  return (
    <ModalContext.Provider
      value={{ isModalOpen, openModal, closeModal, modalData, entityType }}
    >
      {children}
    </ModalContext.Provider>
  );
};
