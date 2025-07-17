import { FaEdit } from "react-icons/fa";
import EditEventForm from "./EditEventForm";
import BaseModal from "./BaseModal";

function EditEventModal({
  isModalOpen,
  closeModal,
  event,
}: {
  isModalOpen: boolean;
  closeModal: () => void;
  event: any; // Pass the event to the form
}) {
  return (
    <BaseModal
      isOpen={isModalOpen}
      onClose={closeModal}
      title="Edit Event"
      subtitle="Update your event details"
      icon={<FaEdit />}
      maxWidth="md:max-w-lg"
      className="max-h-[80vh] overflow-hidden"
    >
      <div className="max-h-[60vh] overflow-y-auto px-1">
        <EditEventForm event={event} closeModal={closeModal} />
      </div>
    </BaseModal>
  );
}

export default EditEventModal;