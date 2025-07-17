import { FaPlus } from "react-icons/fa";
import AddEventForm from "./EventForm";
import BaseModal from "./BaseModal";

function Modal({
  isModalOpen,
  closeModal,
}: {
  isModalOpen: boolean;
  closeModal: () => void;
}) {
  return (
    <BaseModal
      isOpen={isModalOpen}
      onClose={closeModal}
      title="Create New Event"
      subtitle="Add a new event to your calendar"
      icon={<FaPlus />}
      maxWidth="md:max-w-lg"
      className="max-h-[80vh] overflow-hidden z-[9999]"
    >
      <div className="max-h-[60vh] overflow-y-auto px-1">
        <AddEventForm />
      </div>
    </BaseModal>
  );
}

export default Modal;
