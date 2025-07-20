import React, { useEffect } from "react";
import ReactDOM from "react-dom";

/**
 * Modal Portal Example - Shows how React Portal works
 *
 * HOW REACT PORTAL WORKS:
 * 1. Normal React components render within their parent's DOM tree
 * 2. React Portal allows rendering components OUTSIDE the parent DOM tree
 * 3. This is perfect for modals because they need to appear above everything else
 *
 * BENEFITS OF PORTAL:
 * - Modal renders at document root level (not nested in parent components)
 * - Better z-index management (no z-index conflicts)
 * - Prevents parent CSS from affecting modal styling
 * - Modal can truly be "fullscreen" without parent container constraints
 * - Event bubbling still works as expected in React component tree
 */

interface ModalPortalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const ModalPortal: React.FC<ModalPortalProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";

      // Create modal root element if it doesn't exist
      let modalRoot = document.getElementById("modal-root");
      if (!modalRoot) {
        modalRoot = document.createElement("div");
        modalRoot.id = "modal-root";
        modalRoot.style.position = "fixed";
        modalRoot.style.top = "0";
        modalRoot.style.left = "0";
        modalRoot.style.width = "100%";
        modalRoot.style.height = "100%";
        modalRoot.style.zIndex = "9999";
        modalRoot.style.pointerEvents = "none"; // Allow clicks to pass through when empty
        document.body.appendChild(modalRoot);
      }

      // Enable pointer events when modal is active
      modalRoot.style.pointerEvents = "auto";
    }

    return () => {
      // Cleanup function
      document.body.style.overflow = "unset";

      const modalRoot = document.getElementById("modal-root");
      if (modalRoot) {
        modalRoot.style.pointerEvents = "none";
      }
    };
  }, [isOpen]);

  // Don't render anything if modal is closed
  if (!isOpen) return null;

  // Get the modal root element
  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot) return null;

  // REACT PORTAL: Render children OUTSIDE the normal React tree
  // This creates the modal at document.body level instead of nested in parent
  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]"
      onClick={onClose}
      style={{
        // Isolation creates a new stacking context
        isolation: "isolate",
      }}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()} // Prevent close when clicking modal content
      >
        {children}
      </div>
    </div>,
    modalRoot // This is the KEY - renders at modalRoot instead of parent component
  );
};

export default ModalPortal;

/**
 * COMPARISON:
 *
 * WITHOUT PORTAL (your current approach):
 * <div className="parent-component">
 *   <div className="some-content">...</div>
 *   {isOpen && (
 *     <div className="fixed inset-0 z-50">  // Modal renders HERE (inside parent)
 *       Modal Content
 *     </div>
 *   )}
 * </div>
 *
 * WITH PORTAL:
 * <div className="parent-component">
 *   <div className="some-content">...</div>
 *   <ModalPortal isOpen={isOpen}>         // Modal renders at DOCUMENT.BODY level
 *     Modal Content
 *   </ModalPortal>
 * </div>
 *
 * DOM STRUCTURE WITH PORTAL:
 * <body>
 *   <div id="root">
 *     <div className="parent-component">
 *       <div className="some-content">...</div>
 *     </div>
 *   </div>
 *   <div id="modal-root">                  // Modal renders HERE (outside React root)
 *     <div className="fixed inset-0">
 *       Modal Content
 *     </div>
 *   </div>
 * </body>
 */
