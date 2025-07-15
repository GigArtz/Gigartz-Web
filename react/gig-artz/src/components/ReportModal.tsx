import React from "react";
import ReactDOM from "react-dom";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-dark rounded-2xl w-full max-w-md mx-4 p-0 overflow-hidden shadow-lg relative text-gray-500">
        <button
          className="absolute top-4 left-4 text-2xl text-gray-500 hover:text-gray-500 focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="pt-8 pb-2 px-6">
          <h2 className="text-center text-lg font-semibold mb-2">Report</h2>
          <p className="text-center text-base font-medium mb-4">
            Why are you reporting this post?
          </p>
          <ul className="divide-y divide-gray-200">
            {REPORT_REASONS.map((reason) => (
              <li key={reason}>
                <button
                  className="w-full text-left py-3 px-2 hover:bg-gray-800 flex items-center justify-between"
                  onClick={() => onSelectReason(reason)}
                >
                  <span>{reason}</span>
                  <span className="text-gray-400">&gt;</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ReportModal;
