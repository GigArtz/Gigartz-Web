import React, { useState } from "react";
import { FaBackspace, FaRemoveFormat, FaTimesCircle } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { showToast } from "../../store/notificationSlice";

interface ServicePackage {
  name: string;
  additionalCosts: string;
  price: string;
  description: string;
}

interface Service {
  name: string;
  description: string;
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
  const [validationErrors, setValidationErrors] = useState({});

  // Helper to check if a service is complete
  const isServiceComplete = (srv: Service) =>
    srv.name.trim() !== "" &&
    srv.description.trim() !== "" &&
    srv.baseFee &&
    srv.baseFee.trim() !== "" &&
    srv.additionalCosts &&
    srv.additionalCosts.trim() !== "";

  // Error message component (copied from EventForm)
  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return (
      <div className="flex items-center text-red-400 text-sm mt-1">
        <span className="mr-1">⚠️</span>
        {error}
      </div>
    );
  };

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
        baseFee: "",
        additionalCosts: "",
        packages: [],
      },
    ]);
  };

  const dispatch = useDispatch();
  const removeService = (index: number) => {
    if (services.length > 1) {
      setServices(services.filter((_, i) => i !== index));
      if (activeServiceIdx >= services.length - 1) {
        setActiveServiceIdx(Math.max(0, activeServiceIdx - 1));
      }
    } else {
      dispatch(
        showToast({
          message: "You must have at least one service.",
          type: "error",
        })
      );
    }
  };

  const handleSubmit = () => {
    const validServices = services
      .map((srv) => ({
        name: srv.name || "",
        description: srv.description || "",
        baseFee: srv.baseFee || "",
        additionalCosts: srv.additionalCosts || "",
        packages: srv.packages || [],
      }))
      .filter(
        (srv) =>
          srv.name.trim() !== "" &&
          srv.description.trim() !== "" &&
          srv.baseFee &&
          srv.baseFee.trim() !== "" &&
          srv.additionalCosts &&
          srv.additionalCosts.trim() !== "" &&
          srv.packages &&
          srv.packages.length > 0 &&
          srv.packages.every(
            (pkg) =>
              pkg.name.trim() !== "" &&
              pkg.additionalCosts &&
              pkg.additionalCosts.trim() !== "" &&
              pkg.price &&
              pkg.price.trim() !== "" &&
              pkg.description &&
              pkg.description.trim() !== ""
          )
      );
    if (validServices.length === 0) {
      dispatch(
        showToast({
          message:
            "Please add at least one complete service with all required fields and at least one package.",
          type: "error",
        })
      );
      return;
    }
    setServices(validServices);
    dispatch(
      showToast({
        message: "Services Saved!",
        type: "success",
      })
    );
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
    <div className="flex flex-col items-center justify-center w-full min-h-[60vh] p-0">
      {/* Stepper */}
      <div className="flex items-center justify-center gap-6 mb-10">
        <button
          className={`w-10 h-10 flex items-center justify-center rounded-full border-2 font-bold text-lg shadow-md transition-all duration-200
            ${step === 1
              ? 'bg-teal-500 text-white border-teal-500 scale-110'
              : 'bg-gray-800 text-teal-400 border-teal-700 hover:bg-teal-700 hover:text-white'}
          `}
          onClick={() => setStep(1)}
          type="button"
        >
          1
        </button>
        <div className="h-1 w-10 bg-teal-700 rounded-full" />
        <button
          className={`w-10 h-10 flex items-center justify-center rounded-full border-2 font-bold text-lg shadow-md transition-all duration-200
            ${step === 2
              ? 'bg-teal-500 text-white border-teal-500 scale-110'
              : 'bg-gray-800 text-teal-400 border-teal-700 hover:bg-teal-700 hover:text-white'}
          `}
          onClick={() => isServiceComplete(services[activeServiceIdx]) && setStep(2)}
          disabled={!isServiceComplete(services[activeServiceIdx])}
          type="button"
        >
          2
        </button>
      </div>

      {/* Step 1: Add/Edit Services */}
      {step === 1 && (
        <>
          {services.map((srv, index) => (
            <div
              key={index}
              className={`mb-8 p-6 border border-gray-800 relative transition-all duration-200 group ${activeServiceIdx === index ? 'ring-2 ring-teal-400 bg-gray-950 rounded-2xl shadow-lg' : 'opacity-70 bg-gray-900 rounded-xl'} hover:ring-2 hover:ring-teal-300`}
              onClick={() => setActiveServiceIdx(index)}
              style={{ cursor: "pointer" }}
            >
              <button
                className="absolute top-3 right-3 text-red-500 hover:text-red-700 bg-gray-800 rounded-full p-2 shadow transition-all duration-200 opacity-80 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  removeService(index);
                }}
                title="Remove Service"
              >
                <FaRemoveFormat />
              </button>
              {activeServiceIdx === index ? (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-teal-300 mb-2 tracking-wide">Service Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={srv.name}
                      onChange={(e) => handleServiceChange(index, e)}
                      className="input-field focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
                      placeholder="Enter service name"
                    />
                    <ErrorMessage error={validationErrors?.name} />
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-teal-300 mb-2 tracking-wide">Description *</label>
                    <textarea
                      name="description"
                      value={srv.description}
                      onChange={(e) => handleServiceChange(index, e)}
                      className="input-field focus:ring-2 focus:ring-teal-400 focus:border-teal-400 resize-none"
                      placeholder="Describe your service"
                      rows={3}
                    />
                    <ErrorMessage error={validationErrors?.description} />
                  </div>
                  <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-teal-300 mb-2 tracking-wide">Base Fee *</label>
                      <input
                        type="text"
                        name="baseFee"
                        value={srv.baseFee || ""}
                        onChange={(e) => handleServiceChange(index, e)}
                        className="input-field focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
                        placeholder="Base fee (e.g. 1000)"
                      />
                      <ErrorMessage error={validationErrors?.baseFee} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-teal-300 mb-2 tracking-wide">Additional Costs *</label>
                      <input
                        type="text"
                        name="additionalCosts"
                        value={srv.additionalCosts || ""}
                        onChange={(e) => handleServiceChange(index, e)}
                        className="input-field focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
                        placeholder="Additional costs (optional)"
                      />
                      <ErrorMessage error={validationErrors?.additionalCosts} />
                    </div>
                  </div>
                  <div className="flex justify-end mt-6">
                    <button
                      className={`px-6 py-3 rounded-lg font-semibold bg-teal-500 text-white shadow hover:bg-teal-600 transition-all duration-200 text-base flex items-center gap-2 ${!isServiceComplete(srv) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isServiceComplete(srv)) setStep(2);
                      }}
                      disabled={!isServiceComplete(srv)}
                      type="button"
                    >
                      Next: Manage Packages
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-gray-400">
                  <div>
                    <strong>Name:</strong> {srv.name || <span className="italic">(empty)</span>}
                  </div>
                  <div>
                    <strong>Description:</strong> {srv.description || <span className="italic">(empty)</span>}
                  </div>
                </div>
              )}
              {index < services.length - 1 && <div className="border-t border-gray-800 mt-8 mb-2" />}
            </div>
          ))}
          <button
            className="mt-2 w-full px-4 py-3 rounded-lg font-semibold bg-gradient-to-r from-teal-500 to-teal-400 text-white shadow-lg hover:from-teal-600 hover:to-teal-500 transition-all duration-200 text-lg flex items-center justify-center gap-2"
            onClick={addService}
            type="button"
          >
            <span className="text-xl font-bold">+</span> Add Service
          </button>
        </>
      )}

      {/* Step 2: Manage Packages for selected service */}
      {step === 2 && (
        <div className="w-full max-w-lg bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-white mb-2">Service Packages</h2>
            <button
              className="px-4 py-2 rounded-lg bg-gray-700 text-teal-300 hover:bg-gray-800 hover:text-white font-medium transition-all duration-200"
              onClick={() => setStep(1)}
              type="button"
            >
              Back
            </button>
          </div>
          <div className="mb-2 text-gray-300">
            <strong>Service:</strong> {services[activeServiceIdx].name}
          </div>
          <form>
            <div className="space-y-4">
              {(services[activeServiceIdx].packages || []).map((pkg, pkgIdx) => (
                <div
                  key={pkgIdx}
                  className="bg-gray-950 p-4 rounded-xl mb-3 flex flex-col gap-2 border border-gray-800"
                >
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Package Name *</label>
                    <input
                      type="text"
                      placeholder="Package Name"
                      className="w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
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
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Additional Costs</label>
                    <input
                      type="text"
                      placeholder="Additional Costs"
                      className="w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
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
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Price *</label>
                    <input
                      type="text"
                      placeholder="Price"
                      className="w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
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
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description *</label>
                    <textarea
                      placeholder="Description"
                      className="w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 resize-none"
                      value={pkg.description}
                      onChange={(e) =>
                        handlePackageChange(
                          activeServiceIdx,
                          pkgIdx,
                          "description",
                          e.target.value
                        )
                      }
                      rows={2}
                    />
                  </div>
                  <button
                    type="button"
                    className="text-xs text-red-400 self-end mt-1 hover:underline"
                    onClick={() => removePackage(activeServiceIdx, pkgIdx)}
                  >
                    Remove Package
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="w-full px-4 py-3 rounded-lg font-semibold bg-teal-500 text-white shadow hover:bg-teal-600 transition-all duration-200 text-base flex items-center justify-center gap-2"
                onClick={() => addPackage(activeServiceIdx)}
              >
                <span className="text-xl font-bold">+</span> Add Package
              </button>
            </div>
          </form>
          <div className="flex justify-between gap-3 mt-6">
            <button
              className="px-4 py-2 rounded-lg bg-gray-700 text-teal-300 hover:bg-gray-800 hover:text-white font-medium transition-all duration-200"
              onClick={() => setStep(1)}
              type="button"
            >
              Back
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 font-semibold transition-all duration-200"
              onClick={handleSubmit}
              type="button"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesForm;
