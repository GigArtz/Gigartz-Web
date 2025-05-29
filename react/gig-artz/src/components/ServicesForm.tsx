import React, { useState } from "react";
import { FaBackspace, FaRemoveFormat, FaTimesCircle } from "react-icons/fa";
import { toast } from "react-toastify";

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
  offeringOptions?: string;
  baseFee?: string;
  additionalCosts?: string;
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
  const [activeServiceIdx, setActiveServiceIdx] = useState(0);

  // Helper to check if a service is complete
  const isServiceComplete = (srv: Service) =>
    srv.name.trim() !== "" &&
    srv.description.trim() !== "" &&
    srv.offeringOptions &&
    srv.offeringOptions.trim() !== "" &&
    srv.baseFee &&
    srv.baseFee.trim() !== "" &&
    srv.additionalCosts &&
    srv.additionalCosts.trim() !== "";

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
        packages: [],
      },
    ]);
  };

  const removeService = (index: number) => {
    if (services.length > 1) {
      setServices(services.filter((_, i) => i !== index));
      if (activeServiceIdx >= services.length - 1) {
        setActiveServiceIdx(Math.max(0, activeServiceIdx - 1));
      }
    } else {
      toast.error("You must have at least one service.");
    }
  };

  const handleSubmit = () => {
    const validServices = services
      .map((srv) => ({
        name: srv.name || "",
        description: srv.description || "",
        offeringOptions: srv.offeringOptions || "",
        baseFee: srv.baseFee || "",
        additionalCosts: srv.additionalCosts || "",
        packages: srv.packages || [],
      }))
      .filter(
        (srv) =>
          srv.name.trim() !== "" &&
          srv.description.trim() !== "" &&
          srv.offeringOptions &&
          srv.offeringOptions.trim() !== "" &&
          srv.baseFee &&
          srv.baseFee.trim() !== "" &&
          srv.additionalCosts &&
          srv.additionalCosts.trim() !== "" &&
          srv.packages &&
          srv.packages.length > 0 &&
          srv.packages.every(
            (pkg) =>
              pkg.name.trim() !== "" &&
              pkg.baseFee &&
              pkg.baseFee.trim() !== "" &&
              pkg.additionalCosts &&
              pkg.additionalCosts.trim() !== "" &&
              pkg.price &&
              pkg.price.trim() !== "" &&
              pkg.description &&
              pkg.description.trim() !== ""
          )
      );
    if (validServices.length === 0) {
      toast.error(
        "Please add at least one complete service with all required fields and at least one package."
      );
      return;
    }
    setServices(validServices);
    toast.success("Services Saved!");
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
      baseFee: "",
      additionalCosts: "",
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
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center items-center px-5 md:px-2  w-full h-full bg-black bg-opacity-60 backdrop-blur-sm transition-all duration-300 ease-in-out">
      <div className="relative p-4 w-full md:w-[50%] max-w-lg rounded-lg shadow-lg bg-gray-900 transform transition-all duration-300 ease-in-out">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-white">
            {step === 1 ? "Add Services" : "Manage Packages"}
          </h1>

          {step > 1 ? (
            <button
              className="text-gray-400 hover:text-white flex items-center gap-2"
              onClick={() => setStep(1)}
            >
              <FaBackspace /> Back
            </button>
          ) : (
            // Cancel Button
            <button
              className="btn-danger bg-gray-600 rounded-xl p-2 font-bold hover:bg-red-600 transition-colors"
              onClick={onClose}
            >
              <FaTimesCircle className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Step 1: Add/Edit Services */}
        {step === 1 && (
          <div className="px-2 md:max-h-[70vh] max-h-[60vh] overflow-y-auto">
            {services.map((srv, index) => (
              <div
                key={index}
                className={`mb-4 p-3 bg-gray-900 rounded relative ${
                  activeServiceIdx === index ? "" : "opacity-70"
                }`}
                onClick={() => setActiveServiceIdx(index)}
                style={{ cursor: "pointer" }}
              >
                <button
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeService(index);
                  }}
                >
                  <FaRemoveFormat />
                </button>
                {/* Only show form fields for the active service */}
                {activeServiceIdx === index ? (
                  <>
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
                    <label className="text-gray-300 mt-4">
                      Offering Options
                    </label>
                    <input
                      type="text"
                      name="offeringOptions"
                      className="input-field mb-2 mt-1"
                      value={srv.offeringOptions || ""}
                      placeholder="Offering Options"
                      onChange={(e) => handleServiceChange(index, e)}
                    />
                    <label className="text-gray-300 mt-4">Base Fee</label>
                    <input
                      type="text"
                      name="baseFee"
                      className="input-field mb-2 mt-1"
                      value={srv.baseFee || ""}
                      placeholder="Base Fee"
                      onChange={(e) => handleServiceChange(index, e)}
                    />
                    <label className="text-gray-300 mt-4">
                      Additional Costs
                    </label>
                    <input
                      type="text"
                      name="additionalCosts"
                      className="input-field mb-2 mt-1"
                      value={srv.additionalCosts || ""}
                      placeholder="Additional Costs"
                      onChange={(e) => handleServiceChange(index, e)}
                    />
                    {/* Only show Next if service is complete */}
                    {isServiceComplete(srv) && (
                      <button
                        className="btn-primary mt-4 w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStep(2);
                        }}
                      >
                        Next: Manage Packages
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-gray-400">
                    <div>
                      <strong>Name:</strong>{" "}
                      {srv.name || <span className="italic">(empty)</span>}
                    </div>
                    <div>
                      <strong>Description:</strong>{" "}
                      {srv.description || (
                        <span className="italic">(empty)</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <button className="mt-2 w-full btn-secondary" onClick={addService}>
              + Add Another Service
            </button>
          </div>
        )}

        {/* Step 2: Manage Packages for selected service */}
        {step === 2 && (
          <div className="mt-4px-2 md:max-h-[70vh] max-h-[60vh] overflow-y-auto ">
            <div className="mb-2 text-gray-300">
              <strong>Service:</strong> {services[activeServiceIdx].name}
            </div>
            <div className="">
              {(services[activeServiceIdx].packages || []).map(
                (pkg, pkgIdx) => (
                  <div
                    key={pkgIdx}
                    className="bg-gray-900 p-2 rounded mb-2 flex flex-col gap-1"
                  >
                    <input
                      type="text"
                      placeholder="Package Name"
                      className="input-field"
                      value={pkg.name}
                      onChange={(e) =>
                        handlePackageChange(
                          activeServiceIdx,
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
                          activeServiceIdx,
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
                          activeServiceIdx,
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
                          activeServiceIdx,
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
                          activeServiceIdx,
                          pkgIdx,
                          "description",
                          e.target.value
                        )
                      }
                    />
                    <button
                      type="button"
                      className="text-xs text-red-400 self-end mt-1"
                      onClick={() => removePackage(activeServiceIdx, pkgIdx)}
                    >
                      Remove Package
                    </button>
                  </div>
                )
              )}
              <button
                type="button"
                className="btn-secondary mt-1"
                onClick={() => addPackage(activeServiceIdx)}
              >
                + Add Package
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-6 flex justify-between gap-3">
          {/* Only show Save on Step 2 */}
          {step === 2 && (
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
