import React from "react";
import ReactDOM from "react-dom";
import { FaFlag } from "react-icons/fa";
import BaseModal from "./BaseModal";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReason: (reason: string) => void;
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
    >
      <ul className="divide-y divide-gray-600">
        {REPORT_REASONS.map((reason) => (
          <li key={reason}>
            <button
              className="w-full text-left py-3 px-2 hover:bg-gray-800 flex items-center justify-between text-gray-300 hover:text-white transition-colors"
              onClick={() => onSelectReason(reason)}
            >
              <span>{reason}</span>
              <span className="text-gray-400">&gt;</span>
            </button>
          </li>
        ))}
      </ul>
    </BaseModal>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ReportModal;
