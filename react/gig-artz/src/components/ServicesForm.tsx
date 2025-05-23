import React, { useState } from "react";
import { FaBackspace, FaRemoveFormat } from "react-icons/fa";

interface ServicePackage {
  name: string;
  baseFee: string;
  additionalCosts: string;
  price: string;
  description: string;
}

interface Service {
  name: string;
  description: string;
  packages?: ServicePackage[];
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
        packages: [],
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

  const handlePackageChange = (
    serviceIdx: number,
    pkgIdx: number,
    field: keyof ServicePackage,
    value: string
  ) => {
    const updatedServices = [...services];
    const pkgs = updatedServices[serviceIdx].packages || [];
    pkgs[pkgIdx] = { ...pkgs[pkgIdx], [field]: value };
    updatedServices[serviceIdx].packages = pkgs;
    setServices(updatedServices);
  };

  const addPackage = (serviceIdx: number) => {
    const updatedServices = [...services];
    if (!updatedServices[serviceIdx].packages)
      updatedServices[serviceIdx].packages = [];
    updatedServices[serviceIdx].packages!.push({
      name: "",
      price: "",
      description: "",
    });
    setServices(updatedServices);
  };

  const removePackage = (serviceIdx: number, pkgIdx: number) => {
    const updatedServices = [...services];
    if (updatedServices[serviceIdx].packages) {
      updatedServices[serviceIdx].packages = updatedServices[
        serviceIdx
      ].packages!.filter((_, i) => i !== pkgIdx);
      setServices(updatedServices);
    }
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

                {/* Packages Section */}
                <div className="mt-4">
                  <label className="text-gray-300 font-semibold">
                    Packages
                  </label>
                  {(srv.packages || []).map((pkg, pkgIdx) => (
                    <div
                      key={pkgIdx}
                      className="bg-gray-700 p-2 rounded mb-2 flex flex-col gap-1"
                    >
                      <input
                        type="text"
                        placeholder="Package Name"
                        className="input-field"
                        value={pkg.name}
                        onChange={(e) =>
                          handlePackageChange(
                            index,
                            pkgIdx,
                            "name",
                            e.target.value
                          )
                        }
                      />
                      <input
                        type="text"
                        placeholder="Base Fee"
                        className="input-field"
                        value={pkg.baseFee || ""}
                        onChange={(e) =>
                          handlePackageChange(
                            index,
                            pkgIdx,
                            "baseFee",
                            e.target.value
                          )
                        }
                      />
                      <input
                        type="text"
                        placeholder="Additional Costs"
                        className="input-field"
                        value={pkg.additionalCosts || ""}
                        onChange={(e) =>
                          handlePackageChange(
                            index,
                            pkgIdx,
                            "additionalCosts",
                            e.target.value
                          )
                        }
                      />
                      <input
                        type="text"
                        placeholder="Price"
                        className="input-field"
                        value={pkg.price}
                        onChange={(e) =>
                          handlePackageChange(
                            index,
                            pkgIdx,
                            "price",
                            e.target.value
                          )
                        }
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        className="input-field"
                        value={pkg.description}
                        onChange={(e) =>
                          handlePackageChange(
                            index,
                            pkgIdx,
                            "description",
                            e.target.value
                          )
                        }
                      />
                      <button
                        type="button"
                        className="text-xs text-red-400 self-end mt-1"
                        onClick={() => removePackage(index, pkgIdx)}
                      >
                        Remove Package
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn-secondary mt-1"
                    onClick={() => addPackage(index)}
                  >
                    + Add Package
                  </button>
                </div>
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
                {srv.packages && srv.packages.length > 0 && (
                  <div className="mt-2">
                    <strong>Packages:</strong>
                    {srv.packages.map((pkg, pkgIdx) => (
                      <div
                        key={pkgIdx}
                        className="bg-gray-700 p-2 rounded mt-1"
                      >
                        <p>
                          <strong>Name:</strong> {pkg.name}
                        </p>
                        <p>
                          <strong>Base Fee:</strong> {pkg.baseFee}
                        </p>
                        <p>
                          <strong>Additional Costs:</strong>{" "}
                          {pkg.additionalCosts}
                        </p>
                        <p>
                          <strong>Price:</strong> {pkg.price}
                        </p>
                        <p>
                          <strong>Description:</strong> {pkg.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
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
