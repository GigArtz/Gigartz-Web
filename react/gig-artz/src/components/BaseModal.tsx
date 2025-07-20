import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { FaTimesCircle } from "react-icons/fa";

/**
 * BaseModal - Enhanced with React Portal
 *
 * WHAT CHANGED:
 * - Now uses ReactDOM.createPortal() to render outside parent component tree
 * - Modal renders at document.body level in a "modal-root" container
 * - Higher z-index (z-[9999]) for better stacking
 * - CSS isolation with style={{ isolation: "isolate" }}
 *
 * BENEFITS:
 * - Better fullscreen capability
 * - No z-index conflicts with parent components
 * - Prevents parent CSS from affecting modal styling
 * - Modal truly appears above everything else
 */

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

      // Create modal root if it doesn't exist
      let modalRoot = document.getElementById("modal-root");
      if (!modalRoot) {
        modalRoot = document.createElement("div");
        modalRoot.id = "modal-root";
        document.body.appendChild(modalRoot);
      }
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

  // Get or create modal root for React Portal
  let modalRoot = document.getElementById("modal-root");
  if (!modalRoot) {
    modalRoot = document.createElement("div");
    modalRoot.id = "modal-root";
    document.body.appendChild(modalRoot);
  }

  // Use React Portal to render modal outside component tree
  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]"
      onClick={handleBackdropClick}
      style={{ isolation: "isolate" }}
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
    </div>,
    modalRoot // Render at document.body level using React Portal
  );
};

export default BaseModal;
