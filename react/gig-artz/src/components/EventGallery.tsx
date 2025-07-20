import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import {
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaExpand,
  FaCompress,
} from "react-icons/fa";

interface EventGalleryProps {
  images: string[];
}

// Portal Modal Component for better DOM isolation
/**
 * REACT PORTAL MODAL EXPLANATION:
 *
 * This GalleryModal uses React Portal to render outside the normal component tree.
 * Instead of rendering inside the EventGallery component's DOM hierarchy, it renders
 * directly at document.body level in a dedicated "modal-root" container.
 *
 * ADVANTAGES:
 * 1. TRUE FULLSCREEN: Not constrained by parent container dimensions or overflow settings
 * 2. Z-INDEX ISOLATION: No conflicts with parent component z-index stacking
 * 3. CSS ISOLATION: Parent CSS cannot interfere with modal styling
 * 4. BETTER PERFORMANCE: Modal doesn't cause re-renders of parent components
 * 5. ACCESSIBILITY: Modal is at top level of DOM, better for screen readers
 *
 * HOW IT WORKS:
 * - ReactDOM.createPortal(modalContent, targetDOMNode) renders content at targetDOMNode
 * - We create/reuse a "modal-root" div attached to document.body
 * - Modal appears above everything else on the page
 * - React event system still works normally (onClose handlers work as expected)
 *
 * COMPARISON TO YOUR CURRENT MODALS:
 * Your Events page modals use: {isModalOpen && <div className="fixed inset-0">...</div>}
 * This Portal approach renders the same content but OUTSIDE the parent DOM tree
 */
const GalleryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll and create modal root if needed
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
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Get or create modal root
  let modalRoot = document.getElementById("modal-root");
  if (!modalRoot) {
    modalRoot = document.createElement("div");
    modalRoot.id = "modal-root";
    document.body.appendChild(modalRoot);
  }

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex flex-col justify-center items-center
                 animate-in fade-in-0 duration-300 ease-out"
      onClick={onClose}
      style={{ isolation: "isolate" }}
    >
      {children}
    </div>,
    modalRoot
  );
};

const EventGallery: React.FC<EventGalleryProps> = ({ images }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const openModal = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  }, []);

  const closeModal = useCallback(async () => {
    setIsOpen(false);
    setIsFullscreen(false);
    document.body.style.overflow = "unset"; // Restore scrolling

    // Exit fullscreen if currently in fullscreen mode
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (error) {
        console.error("Error exiting fullscreen:", error);
      }
    }
  }, []);

  const showPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const showNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const toggleFullscreen = useCallback(
    async (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();

      try {
        if (!document.fullscreenElement) {
          // Enter fullscreen mode
          await document.documentElement.requestFullscreen();
        } else {
          // Exit fullscreen mode
          await document.exitFullscreen();
        }
      } catch (error) {
        console.error("Fullscreen error:", error);
        // Fallback for browsers that don't support fullscreen API
        setIsFullscreen(!isFullscreen);
      }
    },
    [isFullscreen]
  );

  // Keyboard navigation and fullscreen change detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          closeModal();
          break;
        case "ArrowLeft":
          e.preventDefault();
          setCurrentIndex((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
          );
          break;
        case "ArrowRight":
          e.preventDefault();
          setCurrentIndex((prev) =>
            prev === images.length - 1 ? 0 : prev + 1
          );
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.addEventListener("fullscreenchange", handleFullscreenChange);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isOpen, images.length, closeModal, toggleFullscreen]);

  // Preload images
  useEffect(() => {
    images.forEach((src, index) => {
      const img = new Image();
      img.onload = () => {
        setLoadedImages((prev) => new Set([...prev, index]));
      };
      img.onerror = () => {
        // Handle image load error gracefully
        console.warn(`Failed to load image: ${src}`);
      };
      img.src = src;
    });
  }, [images]);

  // Image preloading
  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages((prev) => new Set([...prev, index]));
  }, []);

  const getGridClass = () => {
    const count = images.length;
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-1 md:grid-cols-2";
    if (count === 3) return "grid-cols-1 md:grid-cols-3";
    if (count === 4) return "grid-cols-2 md:grid-cols-2";
    return "grid-cols-2 md:grid-cols-3";
  };

  return (
    <div className="mt-6">
      {/* Enhanced Gallery Grid */}
      <div className={`grid ${getGridClass()} gap-4 auto-rows-fr`}>
        {images.map((img, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-xl cursor-pointer
                      transform transition-all ease-out
                      hover:scale-[1.02] hover:shadow-xl hover:shadow-teal-500/20
                      active:scale-[0.98]
                      animate-in fade-in-0 slide-in-from-bottom-2"
            style={{
              animationDelay: `${index * 100}ms`,
              animationDuration: "500ms",
              animationFillMode: "both",
              transitionDuration: "300ms",
            }}
            onClick={() => openModal(index)}
          >
            {/* Loading skeleton */}
            {!loadedImages.has(index) && (
              <div
                className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 
                             animate-pulse rounded-xl"
              />
            )}

            {/* Image */}
            <img
              src={img}
              alt={`Event Gallery ${index + 1}`}
              onLoad={() => handleImageLoad(index)}
              className={`w-full h-64 md:h-80 object-cover object-center rounded-xl
                         transition-all duration-500 ease-out
                         group-hover:scale-110 group-hover:brightness-110
                         ${
                           loadedImages.has(index) ? "opacity-100" : "opacity-0"
                         }`}
            />

            {/* Hover Overlay */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent 
                           opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
            />

            {/* Image Number Badge */}
            <div
              className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white 
                           px-3 py-1 rounded-full text-xs font-medium
                           transform scale-75 group-hover:scale-100 transition-transform duration-300"
            >
              {index + 1}
            </div>

            {/* View Icon */}
            <div
              className="absolute inset-0 flex items-center justify-center opacity-0 
                           group-hover:opacity-100 transition-all duration-300"
            >
              <div
                className="bg-black/50 backdrop-blur-sm rounded-full p-3 
                             transform scale-75 group-hover:scale-100 transition-transform duration-300"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Modal/Lightbox using React Portal */}
      <GalleryModal isOpen={isOpen} onClose={closeModal}>
        {/* Header Controls */}
        <div
          className={`absolute top-0 left-0 right-0 z-10 flex justify-between items-center
                         bg-gradient-to-b from-black/50 to-transparent
                         transition-all duration-300
                         ${isFullscreen ? "p-2 md:p-4" : "p-4 md:p-6"}`}
        >
          <div className="flex items-center space-x-4">
            <div className="text-white font-medium">
              {currentIndex + 1} / {images.length}
            </div>
            <div className="hidden md:block text-gray-400 text-sm">
              Use arrow keys to navigate • Double-click image or Press F for
              fullscreen • ESC to close
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Fullscreen Toggle */}
            <button
              className="text-white hover:text-teal-400 p-2 rounded-lg transition-colors duration-200
                          hover:bg-white/10 active:scale-95"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <FaCompress className="w-5 h-5" />
              ) : (
                <FaExpand className="w-5 h-5" />
              )}
            </button>

            {/* Close Button */}
            <button
              className="text-white hover:text-red-400 p-2 rounded-lg transition-colors duration-200
                          hover:bg-white/10 active:scale-95"
              onClick={closeModal}
              aria-label="Close gallery"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Main Image Container */}
        <div
          className={`flex items-center justify-center w-full h-full
                          ${
                            isFullscreen ? "px-2 py-2" : "px-4 md:px-12 py-16"
                          }`}
        >
          {/* Previous Button */}
          <button
            className={`text-white hover:text-teal-400 rounded-full transition-all duration-200
                        hover:bg-white/10 hover:scale-110 active:scale-95 z-10
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                        ${isFullscreen ? "p-4 hover:shadow-lg" : "p-3"}`}
            onClick={showPrev}
            disabled={images.length <= 1}
            aria-label="Previous image"
          >
            <FaChevronLeft className={isFullscreen ? "w-8 h-8" : "w-6 h-6"} />
          </button>

          {/* Image */}
          <div className="flex-1 flex justify-center items-center mx-4 md:mx-8 relative">
            <img
              src={images[currentIndex]}
              alt={`Event Gallery ${currentIndex + 1}`}
              className={`rounded-lg shadow-2xl transition-all duration-500 ease-out object-contain
                           transform hover:scale-[1.02] cursor-pointer
                           ${
                             isFullscreen
                               ? "max-h-[98vh] max-w-[98vw] w-auto h-auto scale-100"
                               : "max-h-[85vh] max-w-[90vw] w-auto h-auto"
                           }`}
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={() => toggleFullscreen()}
            />

            {/* Loading indicator for current image */}
            {!loadedImages.has(currentIndex) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
              </div>
            )}
          </div>

          {/* Next Button */}
          <button
            className={`text-white hover:text-teal-400 rounded-full transition-all duration-200
                        hover:bg-white/10 hover:scale-110 active:scale-95 z-10
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                        ${isFullscreen ? "p-4 hover:shadow-lg" : "p-3"}`}
            onClick={showNext}
            disabled={images.length <= 1}
            aria-label="Next image"
          >
            <FaChevronRight className={isFullscreen ? "w-8 h-8" : "w-6 h-6"} />
          </button>
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent
                         transition-all duration-300
                         ${isFullscreen ? "p-2 md:p-4" : "p-4 md:p-6"}`}
          >
            <div className="flex justify-center space-x-2 overflow-x-auto pb-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                  className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden
                               border-2 transition-all duration-200 hover:scale-105
                               ${
                                 index === currentIndex
                                   ? "border-teal-400 shadow-lg shadow-teal-400/50"
                                   : "border-white/30 hover:border-white/60"
                               }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </GalleryModal>
    </div>
  );
};

export default EventGallery;
