import React, { useState } from "react";

interface EventGalleryProps {
  images: string[];
}

const EventGallery: React.FC<EventGalleryProps> = ({ images }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openModal = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  const showPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const showNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="py-3">
      <div
        className={`flex gap-3 mb-4 overflow-y-auto pb-1 snap-y${
          images.length === 2 ? "flex-col-2" : ""
        }`}
      >
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Event ${index + 1}`}
            onClick={() => openModal(index)}
            className={`h-80 object-cover object-top flex-shrink-0 rounded-lg ${
              images.length === 2 ? "w-[49%]" : "w-80"
            }`}
          />
        ))}
      </div>
      <div className="flex gap-3 mb-4 flex-wrap"></div>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col justify-center items-center"
          onClick={closeModal}
        >
          <button
            className="absolute top-6 right-8 text-white text-3xl font-bold"
            onClick={closeModal}
            aria-label="Close"
          >
            &times;
          </button>
          <div className="flex items-center justify-center w-full h-full">
            <button
              className="text-white text-4xl px-4 py-2 hover:text-teal-400"
              onClick={showPrev}
              aria-label="Previous"
            >
              &#8592;
            </button>
            <img
              src={images[currentIndex]}
              alt={`Event ${currentIndex + 1}`}
              className="max-h-[80vh] max-w-[90vw] rounded-lg shadow-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="text-white text-4xl px-4 py-2 hover:text-teal-400"
              onClick={showNext}
              aria-label="Next"
            >
              &#8594;
            </button>
          </div>
          <div className="text-white mt-4">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventGallery;
