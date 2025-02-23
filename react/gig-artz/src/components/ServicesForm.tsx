import React, { useState } from "react";
import { FaBackspace, FaRemoveFormat } from "react-icons/fa";

interface ServicesFormProps {
  onClose: () => void;
  service: { name: string; description: string };
  setService: React.Dispatch<
    React.SetStateAction<{ name: string; description: string }>
  >;
  packages: { name: string; baseFee: string; additionalCosts: string }[];
  setPackages: React.Dispatch<
    React.SetStateAction<
      { name: string; baseFee: string; additionalCosts: string }[]
    >
  >;
}

const ServicesForm: React.FC<ServicesFormProps> = ({
  onClose,
  service,
  setService,
  packages,
  setPackages,
}) => {
  const [step, setStep] = useState(1);

  // Handle Input Changes
  const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setService({ ...service, [e.target.name]: e.target.value });
  };

  const handlePackageChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedPackages = [...packages];
    updatedPackages[index] = {
      ...updatedPackages[index],
      [e.target.name]: e.target.value,
    };
    setPackages(updatedPackages);
  };

  const addPackage = () => {
    setPackages([...packages, { name: "", baseFee: "", additionalCosts: "" }]);
  };

  const removePackage = (index: number) => {
    if (packages.length > 1) {
      setPackages(packages.filter((_, i) => i !== index));
    } else {
      alert("You must have at least one package.");
    }
  };

  const removeService = () => {
    if (window.confirm("Are you sure you want to cancel this service?")) {
      setService({ name: "", description: "" });
      setPackages([{ name: "", baseFee: "", additionalCosts: "" }]);
      setStep(1);
      onClose();
    }
  };

  const handleSubmit = () => {
    console.log("Service:", service);
    console.log("Packages:", packages);
    alert("Service & Packages Saved!");
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md z-50">
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-96 border overflow-visible">
        <div className="flex justify-between items-center mb-4">
          {/* Modal Header */}
          <h1 className="text-2xl font-bold text-white">
            {step === 1
              ? "Add Service"
              : step === 2
              ? "Add Packages"
              : "Review & Confirm"}
          </h1>

          {/* Back Button */}
          {step > 1 && (
            <button
              className="text-gray-400 hover:text-white flex items-center gap-2"
              onClick={() => setStep(step - 1)}
            >
              <FaBackspace /> Back
            </button>
          )}
        </div>

        {/* Step 1: Add Service */}
        {step === 1 && (
          <div className="mt-4">
            <label className="text-gray-300">Service Name</label>
            <input
              type="text"
              name="name"
              className="input-field mb-2 mt-1"
              value={service.name}
              placeholder="Service Name"
              onChange={handleServiceChange}
            />
            <label className="text-gray-300 mt-4">Description</label>
            <input
              type="text"
              name="description"
              className="input-field mb-2 mt-1"
              value={service.description}
              placeholder="Description"
              onChange={handleServiceChange}
            />
          </div>
        )}

        {/* Step 2: Add Packages */}
        {step === 2 && (
          <div className="mt-4">
            {packages.map((pkg, index) => (
              <div
                key={index}
                className="mb-4 p-3 bg-gray-800 rounded relative"
              >
                <button
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  onClick={() => removePackage(index)}
                >
                  <FaRemoveFormat />
                </button>

                <label className="text-gray-300">Package Name</label>
                <input
                  type="text"
                  name="name"
                  className="input-field mb-2 mt-1"
                  value={pkg.name}
                  placeholder="Package Name"
                  onChange={(e) => handlePackageChange(index, e)}
                />
                <label className="text-gray-300 mt-4">Base Fee</label>
                <input
                  type="text"
                  name="baseFee"
                  className="input-field mb-2 mt-1"
                  placeholder="Base Fee"
                  value={pkg.baseFee}
                  onChange={(e) => handlePackageChange(index, e)}
                />
                <label className="text-gray-300 mt-4">Additional Costs</label>
                <input
                  type="text"
                  name="additionalCosts"
                  className="input-field mb-2 mt-1"
                  placeholder="Additional Costs"
                  value={pkg.additionalCosts}
                  onChange={(e) => handlePackageChange(index, e)}
                />
              </div>
            ))}
            <button className="mt-2 w-full btn-secondary" onClick={addPackage}>
              + Add Another Package
            </button>
          </div>
        )}

        {/* Step 3: Review & Confirm */}
        {step === 3 && (
          <div className="mt-4 text-gray-300">
            <h2 className="text-xl font-semibold">Review Service</h2>
            <p>
              <strong>Name:</strong> {service.name}
            </p>
            <p>
              <strong>Description:</strong> {service.description}
            </p>

            <h2 className="text-xl font-semibold mt-4">Review Packages</h2>
            {packages.map((pkg, index) => (
              <div key={index} className="bg-gray-800 p-3 rounded mt-2">
                <p>
                  <strong>Package:</strong> {pkg.name}
                </p>
                <p>
                  <strong>Base Fee:</strong> {pkg.baseFee}
                </p>
                <p>
                  <strong>Additional Costs:</strong> {pkg.additionalCosts}
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
          {step < 3 ? (
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
