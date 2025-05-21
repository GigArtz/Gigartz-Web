import React, { useState } from "react";
import { FaTimesCircle } from "react-icons/fa";

interface BookingFormData {
  eventDetails: string;
  date: string;
  time: string;
  venue: string;
  additionalInfo: string;
}

interface Service {
  name: string;
  offeringOptions: string;
  baseFee: string;
  additionalCosts: string;
  description: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BookingFormData & { serviceName: string }) => void;
  services: Service[];
}

const BookingModal: React.FC<BookingModalProps> = ({
  services,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [selectedService, setSelectedService] = useState<string>("");
  const [formData, setFormData] = useState<BookingFormData>({
    eventDetails: "",
    date: "",
    time: "",
    venue: "",
    additionalInfo: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    onSubmit({ ...formData, serviceName: selectedService });
    setFormData({
      eventDetails: "",
      date: "",
      time: "",
      venue: "",
      additionalInfo: "",
    });
    setSelectedService("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-dark rounded-lg shadow-lg w-11/12 max-w-md p-4">
        <form onSubmit={handleSubmit} className="p-4">
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-4 pb-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Book Freelancer
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
            >
              <FaTimesCircle className="w-6 h-6 hover:text-red-500" />
            </button>
          </div>

          {/* Service Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Select a Service
            </label>
            <div className="flex flex-col gap-2">
              {services && services.length > 0 ? (
                services.map((service) => (
                  <button
                    type="button"
                    key={service.name}
                    className={`border rounded p-2 text-left ${
                      selectedService === service.name
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300"
                    }`}
                    onClick={() => setSelectedService(service.name)}
                  >
                    <div className="font-semibold">{service.name}</div>
                    <div className="text-xs text-gray-500">
                      {service.offeringOptions}
                    </div>
                    <div className="text-xs text-gray-400">
                      Base Fee: {service.baseFee} | Additional:{" "}
                      {service.additionalCosts}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {service.description}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-gray-400">No services available.</div>
              )}
            </div>
          </div>

          {/* Booking Form - only show if a service is selected */}
          {selectedService && (
            <React.Fragment>
              <div className="mb-2">
                <label className="block text-sm font-medium">
                  Event Details
                </label>
                <input
                  type="text"
                  name="eventDetails"
                  value={formData.eventDetails}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Event details"
                  required
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium">Time</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium">Venue</label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Venue"
                  required
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium">
                  Additional Info
                </label>
                <textarea
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleChange}
                  placeholder="Additional information"
                  className="input-field"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="submit" className="btn-primary">
                  Book
                </button>
              </div>
            </React.Fragment>
          )}
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
