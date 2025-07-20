import React from "react";
import ReactDOM from "react-dom";
import { FaFlag } from "react-icons/fa";
import BaseModal from "./BaseModal";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReason?: (reason: string) => void;
  onSubmit?: (reason: string, additionalDetails?: string) => void;
}

const REPORT_REASONS = [
  "I just don't like it",
  "Bullying or unwanted contact",
  "Suicide, self-injury or eating disorders",
  "Violence, hate or exploitation",
  "Selling or promoting restricted items",
  "Nudity or sexual activity",
  "Scam, fraud or spam",
  "False information",
];

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onSelectReason,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const modalContent = (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Report"
      subtitle="Why are you reporting this post?"
      icon={<FaFlag className="w-5 h-5" />}
      closeOnClickOutside={true}
      maxWidth="max-w-md"
      minWidth="min-w-80"
      className="bg-dark p-0 rounded-xl overflow-hidden shadow-2xl"
      showCloseButton={false}
    >
      <ul className="divide-y divide-gray-800">
        {REPORT_REASONS.map((reason) => (
          <li key={reason}>
            <button
              className="w-full text-left py-2 px-4 hover:bg-gray-900 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
              onClick={() => {
                if (onSelectReason) onSelectReason(reason);
                if (onSubmit) onSubmit(reason);
              }}
            >
              <span className="text-sm">{reason}</span>
            </button>
          </li>
        ))}
      </ul>
    </BaseModal>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ReportModal;
