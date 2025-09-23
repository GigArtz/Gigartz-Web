import React, { useEffect, useState } from "react";
import { FaCalendarPlus } from "react-icons/fa";
import BaseModal from "./BaseModal";

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
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
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
    // Directly submit booking without payment step
    onSubmit({ ...formData, serviceName: selectedService });
    // Reset and close modal
    setFormData({
      eventDetails: "",
      date: "",
      time: "",
      venue: "",
      additionalInfo: "",
    });
    setSelectedService(null);
    setSelectedPackage(null);
    onClose();
  };

  const handleServiceSelect = (key: string) => {
    setSelectedService(key);
    setSelectedPackage(null); // reset package when switching service
    setStep(2); // move to Step 2
  };

  const handlePackageSelect = (pkgId: string) => {
    setSelectedPackage(pkgId);
  };

  // Handler for going back to service selection
  const handleBackToService = () => {
    // reset selected service and package and go back to step 1
    setSelectedService(null);
    setSelectedPackage(null);
    setStep(1);
  };

  useEffect(() => {
    console.log(services);
  }, [services]);

  useEffect(() => {
    if (isOpen && services.length === 1) {
      // Auto-select the only service and go to step 2
      const onlyService = services[0];
      const key = onlyService.name ?? onlyService.serviceName ?? 0;
      setSelectedService(key);
      setStep(2);
    } else if (isOpen && services.length !== 1) {
      // Reset selection if not single service
      setSelectedService("");
      setStep(1);
    }
  }, [isOpen, services]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Book Freelancer"
      icon={<FaCalendarPlus />}
      maxWidth="md:max-w-md"
    >
      <form onSubmit={handleSubmit} className="p-4">
        {/* Step 1: Service Selection */}
        {step === 1 && (
          <div className="mb-4">
            <label className="block text-teal-500 text-sm font-medium mb-1">
              Select a Service
            </label>
            <div className="flex flex-col gap-2">
              {services ? (
                (Array.isArray(services) ? services : [services]).map(
                  (service, idx) => {
                    const key = service.name ?? service.serviceName ?? idx;
                    const displayName =
                      service.name ?? service.serviceName ?? "Unnamed Service";
                    const description = service.description ?? "";
                    const baseFee = service.baseFee ?? service.price;
                    const additionalCosts =
                      service.additionalCosts ?? service.additionalCost;
                    const packages = Array.isArray(service.packages)
                      ? service.packages
                      : [];

                    return (
                      <button
                        type="button"
                        key={key}
                        className={`p-2 rounded text-left transition-colors duration-150 ${
                          selectedService === key
                            ? "border-teal-500 bg-teal-800 text-white"
                            : "border-teal-300 bg-gray-700 text-teal-200 hover:bg-teal-600"
                        }`}
                        onClick={() => handleServiceSelect(key)}
                      >
                        <div className="font-semibold">{displayName}</div>
                        {description && (
                          <div className="text-xs text-gray-400 mt-1">
                            {description}
                          </div>
                        )}
                        {baseFee && (
                          <div className="text-xs text-gray-400">
                            Base Fee: {baseFee}
                            {additionalCosts &&
                              ` | Additional: ${additionalCosts}`}
                          </div>
                        )}
                        {packages.length > 0 && (
                          <div className="text-xs text-teal-300 mt-1">
                            {packages.map((pkg, idx) => (
                              <span key={idx} className="block">
                                {pkg.name} - Base Fee:{" "}
                                {pkg.baseFee ?? pkg.price}
                                {pkg.additionalCost &&
                                  ` | Additional: ${pkg.additionalCost}`}
                              </span>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  }
                )
              ) : (
                <p className="text-gray-400">No services available.</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Package Selection */}
        {step === 2 && selectedService && (
          <div className="mb-4">
            <label className="block text-teal-500 text-sm font-medium mb-1">
              Select a Package
            </label>

            <div className="flex flex-col gap-2">
              {(() => {
                const service = (
                  Array.isArray(services) ? services : [services]
                ).find((s) => (s.name ?? s.serviceName) === selectedService);

                if (!service)
                  return <p className="text-gray-400">Service not found.</p>;

                const packages = Array.isArray(service.packages)
                  ? service.packages
                  : [];

                return packages.length ? (
                  packages.map((pkg, idx) => {
                    const pkgId = pkg.id ?? `${selectedService}-pkg-${idx}`;
                    return (
                      <button
                        type="button"
                        key={pkgId}
                        className={`p-2 rounded text-left transition-colors duration-150 ${
                          selectedPackage === pkgId
                            ? "border-teal-500 bg-teal-800 text-white"
                            : "border-teal-300  text-teal-200 hover:bg-teal-800"
                        }`}
                        onClick={() => handlePackageSelect(pkgId)}
                      >
                        <div className="font-semibold">
                          {pkg.name ?? "Unnamed Package"}
                        </div>
                        {pkg.description && (
                          <div className="text-xs text-gray-400 mt-1">
                            {pkg.description}
                          </div>
                        )}
                        <div className="text-xs text-gray-400">
                          Base Fee: {pkg.baseFee ?? pkg.price}
                          {pkg.additionalCost &&
                            ` | Additional: ${pkg.additionalCost}`}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <p className="text-gray-400">
                    No packages available for this service.
                  </p>
                );
              })()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-4">
              <button
                type="button"
                onClick={handleBackToService}
                className="btn-primary w-32  text-sm"
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={!selectedPackage}
                onClick={() => setStep(3)}
                className="btn-primary w-32 text-sm disabled:opacity-50"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Booking Form Fields */}
        {step === 3 &&
          selectedService &&
          selectedPackage &&
          (() => {
            const normalizedServices = Array.isArray(services)
              ? services
              : [services];

            const serviceObj = normalizedServices.find((s, idx) => {
              const key = s.name ?? s.serviceName ?? idx;
              return key === selectedService;
            });

            if (!serviceObj) return null;

            const packages = Array.isArray(serviceObj.packages)
              ? serviceObj.packages
              : [];

            const selectedPkg = packages.find((pkg, idx) => {
              const pkgId = pkg.id ?? `${selectedService}-pkg-${idx}`;
              return pkgId === selectedPackage;
            });

            return (
              <>
                {/* Summary */}
                <div className="mb-4 text-sm text-teal-200">
                  <p>
                    <strong>Service:</strong>{" "}
                    {serviceObj.name ?? serviceObj.serviceName ?? "Unnamed"}
                  </p>
                  <p>
                    <strong>Package:</strong>{" "}
                    {selectedPkg?.name ?? "Unnamed Package"}
                  </p>
                </div>

                {/* Back Navigation */}
                <button
                  type="button"
                  className="mb-2 text-teal-400 hover:underline text-sm flex items-end"
                  onClick={() => setStep(2)}
                >
                  ← Back to Package Selection
                </button>

                {/* Booking Form */}
                <div className="min-h-16 overflow-x-auto p-2">
                  <div className="mb-2">
                    <label className="block text-sm font-medium p-1">
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
                    <label className="block text-sm font-medium p-1">
                      Date
                    </label>
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
                    <label className="block text-sm font-medium p-1">
                      Time
                    </label>
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
                    <label className="block text-sm font-medium p-1">
                      Venue
                    </label>
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
                    <label className="block text-sm font-medium p-1">
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

                <div className="flex justify-end gap-2 mt-4">
                  <button type="submit" className="btn-primary">
                    Book
                  </button>
                </div>

                {/* Payment flow removed: booking is dispatched directly via onSubmit */}
              </>
            );
          })()}
      </form>
    </BaseModal>
  );
};

export default BookingModal;
