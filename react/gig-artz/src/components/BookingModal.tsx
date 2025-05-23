import React, { useEffect, useState } from "react";
import { FaTimesCircle } from "react-icons/fa";

interface BookingFormData {
  eventDetails: string;
  date: string;
  time: string;
  venue: string;
  additionalInfo: string;
}

interface ServicePackage {
  name: string;
  price: string;
  description: string;
}

interface Service {
  name: string;
  offeringOptions: string;
  baseFee: string;
  additionalCosts: string;
  description: string;
  packages?: ServicePackage[]; // New: array of packages per service
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

  useEffect(() => {
    console.log(services);
  }, [services]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-dark rounded-lg shadow-lg w-11/12 max-w-md p-4">
        <form onSubmit={handleSubmit} className="p-4">
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-4 pb-1">
            <h3 className="text-xl font-semibold text-white">
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
                services.map((service, idx) => {
                  // Support all formats: name, serviceName, packages, baseFee, additionalCost
                  const key = service.name ?? service["serviceName"] ?? idx;
                  const displayName =
                    service.name ?? service["serviceName"] ?? "Unnamed Service";
                  const description =
                    service.description ?? service["description"] ?? "";
                  const baseFee = service.baseFee ?? service["baseFee"];
                  const additionalCosts =
                    service.additionalCosts ??
                    service["additionalCosts"] ??
                    service["additionalCost"];
                  const packages =
                    service.packages ?? service["packages"] ?? [];
                  return (
                    <button
                      type="button"
                      key={key}
                      className={`border rounded p-2 text-left transition-colors duration-150 ${
                        selectedService === key
                          ? "border-teal-500 bg-gray-800 text-white"
                          : "border-teal-300 bg-gray-700 text-teal-200 hover:bg-gray-600"
                      }`}
                      onClick={() =>
                        selectedService === key
                          ? setSelectedService("")
                          : setSelectedService(key)
                      }
                    >
                      <div className="font-semibold">{displayName}</div>
                      {description && (
                        <div className="text-xs text-gray-400 mt-1">
                          {description}
                        </div>
                      )}
                      {/* Show flat fields if present (old format) */}
                      {baseFee && (
                        <div className="text-xs text-gray-400">
                          Base Fee: {baseFee}
                          {additionalCosts &&
                            ` | Additional: ${additionalCosts}`}
                        </div>
                      )}
                      {/* Show packages summary if present */}
                      {Array.isArray(packages) && packages.length > 0 && (
                        <div className="text-xs text-teal-300 mt-1">
                          {packages.map((pkg, idx) => (
                            <span key={idx} className="block">
                              {pkg.name} - Base Fee:{" "}
                              {pkg["baseFee"] ?? pkg["price"]}{" "}
                              {pkg["additionalCost"]
                                ? `| Additional: ${pkg["additionalCost"]}`
                                : ""}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="text-gray-400">No services available.</div>
              )}
            </div>
          </div>

          {/* Booking Form - only show if a service is selected */}
          {selectedService &&
            (() => {
              // Find by name or serviceName
              const serviceObj = services.find(
                (s, idx) =>
                  (s.name ?? s["serviceName"] ?? idx) === selectedService
              );
              if (!serviceObj) return null;
              const packages =
                serviceObj.packages ?? serviceObj["packages"] ?? [];
              return (
                <React.Fragment>
                  <button
                    type="button"
                    className="mb-2 text-teal-400 hover:underline text-sm"
                    onClick={() => setSelectedService("")}
                  >
                    ← Back to Service Selection
                  </button>
                  {/* Show packages if available */}
                  {Array.isArray(packages) && packages.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1 text-teal-300">
                        Select a Package
                      </label>
                      <div className="flex flex-row gap-2 overflow-x-auto pb-2">
                        {packages.map((pkg, idx) => (
                          <div
                            key={idx}
                            className="min-w-[180px] border border-teal-400 rounded p-2 bg-gray-900"
                          >
                            <div className="font-semibold text-teal-200">
                              {pkg.name}
                            </div>
                            <div className="text-xs text-gray-400">
                              {pkg.description}
                            </div>
                            <div className="text-xs text-teal-300 mt-1">
                              Price: {pkg["price"] ?? pkg["baseFee"]}
                            </div>
                            {pkg["additionalCost"] && (
                              <div className="text-xs text-gray-400">
                                Additional: {pkg["additionalCost"]}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border min-h-16 overflow-x-auto">
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
                  </div>

                  <div className="flex justify-end gap-2">
                    <button type="submit" className="btn-primary">
                      Book
                    </button>
                  </div>
                </React.Fragment>
              );
            })()}
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
