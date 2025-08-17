import { useModal } from "@/features/modalOpen/hook";
import { CharacterModal } from "@/shared/ui/CharacterModal";
import { ManagerModal } from "@/shared/ui/ManagerModal";

export const ModalController: React.FC = () => {
  const { entityType } = useModal();

  if (entityType === "character") {
    return <CharacterModal />;
  } else if (entityType === "manager") {
    return <ManagerModal />;
  }

  return null;
};
