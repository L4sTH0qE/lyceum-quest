export type ModalContextType = {
  isModalOpen: boolean;
  openModal: (data?: any, type?: string) => void;
  closeModal: () => void;
  modalData: any;
  entityType: string | null;
};
