import { useState, useEffect } from "react";

const EventGalleryCarousel = ({ event }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === event.gallery.length - 1 ? 0 : prev + 1
      );
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [event.gallery.length]);

  // Manual slide controls
  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev === event.gallery.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? event.gallery.length - 1 : prev - 1
    );
  };

  return (
    <div className="relative w-full mx-auto">
      {/* Carousel Container */}
      <div className="overflow-hidden relative h-80 rounded-lg">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {event.gallery.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Event ${index + 1}`}
              className="w-full h-80 object-cover object-top flex-shrink-0"
            />
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full"
      >
        ❮
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full"
      >
        ❯
      </button>

      {/* Indicators */}
      <div className="flex justify-center space-x-2 mt-2">
        {event.gallery.map((_, index) => (
          <span
            key={index}
            className={`w-3 h-3 rounded-full transition-all ${
              currentIndex === index ? "bg-blue-500 scale-125" : "bg-gray-400"
            }`}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default EventGalleryCarousel;