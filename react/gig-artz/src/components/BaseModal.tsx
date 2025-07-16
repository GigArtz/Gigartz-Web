import React, { useEffect, useRef } from "react";
import { FaTimesCircle } from "react-icons/fa";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
  closeOnClickOutside?: boolean;
  maxWidth?: string;
  minWidth?: string;
}

const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  className = "",
  showCloseButton = true,
  closeOnClickOutside = true,
  maxWidth = "md:max-w-2xl",
  minWidth = "min-w-96",
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal on escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Handle click outside to close
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (
      closeOnClickOutside &&
      modalRef.current &&
      !modalRef.current.contains(event.target as Node)
    ) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={`p-4 ${minWidth} ${maxWidth} w-full mx-4 bg-dark rounded-lg shadow-lg relative animate-fadeIn ${className}`}
      >
        {/* Modal Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between mb-4 p-1 py-2 border-b border-gray-500">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="p-2 bg-teal-600 rounded-full text-white">
                  {icon}
                </div>
              )}
              <div>
                {title && (
                  <h3 className="text-xl font-semibold text-teal-500">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-400">{subtitle}</p>
                )}
              </div>
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <FaTimesCircle className="w-6 h-6 hover:text-red-500" />
              </button>
            )}
          </div>
        )}

        {/* Modal Content */}
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
};

export default BaseModal;
