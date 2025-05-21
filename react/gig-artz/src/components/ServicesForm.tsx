import React, { useState } from "react";
import { FaBackspace, FaRemoveFormat } from "react-icons/fa";

interface Service {
  name: string;
  description: string;
  offeringOptions: string;
  baseFee: string;
  additionalCosts: string;
}

interface ServicesFormProps {
  onClose: () => void;
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
}

const ServicesForm: React.FC<ServicesFormProps> = ({
  onClose,
  services,
  setServices,
}) => {
  const [step, setStep] = useState(1);

  // Handle Input Changes for a service
  const handleServiceChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedServices = [...services];
    updatedServices[index] = {
      ...updatedServices[index],
      [e.target.name]: e.target.value,
    };
    setServices(updatedServices);
  };

  const addService = () => {
    setServices([
      ...services,
      {
        name: "",
        description: "",
        offeringOptions: "",
        baseFee: "",
        additionalCosts: "",
      },
    ]);
  };

  const removeService = (index: number) => {
    if (services.length > 1) {
      setServices(services.filter((_, i) => i !== index));
    } else {
      alert("You must have at least one service.");
    }
  };

  const handleSubmit = () => {
    // You can add validation or API call here
    alert("Services Saved!");
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md z-50">
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-96 border overflow-visible">
        <div className="flex justify-between items-center mb-4">
          {/* Modal Header */}
          <h1 className="text-2xl font-bold text-white">
            {step === 1 ? "Add Services" : "Review & Confirm"}
          </h1>
          {step > 1 && (
            <button
              className="text-gray-400 hover:text-white flex items-center gap-2"
              onClick={() => setStep(step - 1)}
            >
              <FaBackspace /> Back
            </button>
          )}
        </div>

        {/* Step 1: Add Services */}
        {step === 1 && (
          <div className="mt-4">
            {services.map((srv, index) => (
              <div
                key={index}
                className="mb-4 p-3 bg-gray-800 rounded relative"
              >
                <button
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  onClick={() => removeService(index)}
                >
                  <FaRemoveFormat />
                </button>
                <label className="text-gray-300">Service Name</label>
                <input
                  type="text"
                  name="name"
                  className="input-field mb-2 mt-1"
                  value={srv.name}
                  placeholder="Service Name"
                  onChange={(e) => handleServiceChange(index, e)}
                />
                <label className="text-gray-300 mt-4">Description</label>
                <input
                  type="text"
                  name="description"
                  className="input-field mb-2 mt-1"
                  value={srv.description}
                  placeholder="Description"
                  onChange={(e) => handleServiceChange(index, e)}
                />
                <label className="text-gray-300 mt-4">Offering Options</label>
                <input
                  type="text"
                  name="offeringOptions"
                  className="input-field mb-2 mt-1"
                  value={srv.offeringOptions}
                  placeholder="Offering Options"
                  onChange={(e) => handleServiceChange(index, e)}
                />
                <label className="text-gray-300 mt-4">Base Fee</label>
                <input
                  type="text"
                  name="baseFee"
                  className="input-field mb-2 mt-1"
                  value={srv.baseFee}
                  placeholder="Base Fee"
                  onChange={(e) => handleServiceChange(index, e)}
                />
                <label className="text-gray-300 mt-4">Additional Costs</label>
                <input
                  type="text"
                  name="additionalCosts"
                  className="input-field mb-2 mt-1"
                  value={srv.additionalCosts}
                  placeholder="Additional Costs"
                  onChange={(e) => handleServiceChange(index, e)}
                />
              </div>
            ))}
            <button className="mt-2 w-full btn-secondary" onClick={addService}>
              + Add Another Service
            </button>
          </div>
        )}

        {/* Step 2: Review & Confirm */}
        {step === 2 && (
          <div className="mt-4 text-gray-300">
            <h2 className="text-xl font-semibold mb-2">Review Services</h2>
            {services.map((srv, index) => (
              <div key={index} className="bg-gray-800 p-3 rounded mt-2">
                <p>
                  <strong>Name:</strong> {srv.name}
                </p>
                <p>
                  <strong>Description:</strong> {srv.description}
                </p>
                <p>
                  <strong>Offering Options:</strong> {srv.offeringOptions}
                </p>
                <p>
                  <strong>Base Fee:</strong> {srv.baseFee}
                </p>
                <p>
                  <strong>Additional Costs:</strong> {srv.additionalCosts}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-6 flex justify-between gap-3">
          {/* Cancel Button */}
          <button
            className="btn-danger bg-gray-600 rounded-xl p-2 font-bold"
            onClick={onClose}
          >
            Cancel
          </button>

          {/* Next / Submit */}
          {step < 2 ? (
            <button className="btn-primary" onClick={() => setStep(step + 1)}>
              Next
            </button>
          ) : (
            <button className="btn-primary" onClick={handleSubmit}>
              Confirm & Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicesForm;
