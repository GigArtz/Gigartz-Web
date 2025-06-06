import React, { useEffect, useState } from "react";
import { FaTimesCircle } from "react-icons/fa";
import Payment from "./Payment";

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
  const [showPayment, setShowPayment] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<
    (BookingFormData & { serviceName: string }) | null
  >(null);
  const [pendingAmount, setPendingAmount] = useState<number>(0);
  const [step, setStep] = useState<1 | 2>(1);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    // Find the selected service and get its price
    const serviceObj = services.find(
      (s, idx) => (s.name ?? s["serviceName"] ?? idx) === selectedService
    );
    let amount = 0;
    if (serviceObj) {
      // Prefer package price if packages exist and user selects one (not implemented here, can be extended)
      if (
        Array.isArray(serviceObj.packages) &&
        serviceObj.packages.length > 0
      ) {
        // For now, just use the first package's price
        amount = Number(
          serviceObj.packages[0].price || serviceObj.packages[0].baseFee || 0
        );
      } else {
        amount = Number(serviceObj.baseFee || serviceObj.price || 0);
      }
    }
    setPendingBooking({ ...formData, serviceName: selectedService });
    setPendingAmount(amount);
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    if (pendingBooking) {
      onSubmit(pendingBooking);
      setPendingBooking(null);
    }
  };

  const handlePaymentFailure = () => {
    setShowPayment(false);
    setPendingBooking(null);
  };

  const handleServiceSelect = (key: string) => {
    setSelectedService(key);
    setStep(2);
  };

  const handleBackToService = () => {
    setSelectedService("");
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

          {/* Step 1: Service Selection */}
          {step === 1 && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Select a Service
              </label>
              <div className="flex flex-col gap-2">
                {services ? (
                  (Array.isArray(services) ? services : [services]).map(
                    (service, idx) => {
                      const key = service.name ?? service.serviceName ?? idx;
                      const displayName =
                        service.name ??
                        service.serviceName ??
                        "Unnamed Service";
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
                          className={`border rounded p-2 text-left transition-colors duration-150 ${
                            selectedService === key
                              ? "border-teal-500 bg-gray-800 text-white"
                              : "border-teal-300 bg-gray-700 text-teal-200 hover:bg-gray-600"
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

        {/* Step 2: Booking Form Fields */}
{step === 2 && selectedService && (() => {
  // Normalize services to always be an array
  const normalizedServices = Array.isArray(services) ? services : [services];

  // Match selected service by name, serviceName, or index fallback
  const serviceObj = normalizedServices.find((s, idx) => {
    const key = s.name ?? s.serviceName ?? idx;
    return key === selectedService;
  });

  if (!serviceObj) return null;

  const packages = Array.isArray(serviceObj.packages)
    ? serviceObj.packages
    : [];

  return (
    <React.Fragment>
      {packages.length > 0 && (
        <div className="mb-4">
          <p>
            Selected Package:{" "}
            {packages.map((pkg, idx) => (
              <span key={idx}>
                {pkg.name}
                {idx < packages.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
        </div>
      )}

      <button
        type="button"
        className="mb-2 text-teal-400 hover:underline text-sm flex items-end"
        onClick={handleBackToService}
      >
        ← Back to Service Selection
      </button>

      <div className="min-h-16 overflow-x-auto">
        <div className="mb-2">
          <label className="block text-sm font-medium">Event Details</label>
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

      {showPayment && (
        <Payment
          amount={pendingAmount}
          type="booking"
          bookingDetails={pendingBooking || {}}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
          onClose={() => setShowPayment(false)}
        />
      )}
    </React.Fragment>
  );
})()}

        </form>
      </div>
    </div>
  );
};

export default BookingModal;
