import React, { useState } from "react";
import { FaTimesCircle } from "react-icons/fa";
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
  const dispatch = useDispatch();

  const inputClass =
    "w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200";

  const isServiceComplete = (srv: Service | undefined | null) => {
    if (!srv) return false;
    return (
      srv.name?.trim() !== "" &&
      srv.description?.trim() !== "" &&
      srv.baseFee?.trim() !== "" &&
      srv.additionalCosts?.trim() !== ""
    );
  };

  const handleServiceChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

  const addPackage = (serviceIdx: number) => {
    const updatedServices = [...services];
    updatedServices[serviceIdx].packages = [
      ...(updatedServices[serviceIdx].packages || []),
      {
        name: "",
        additionalCosts: "",
        price: "",
        description: "",
      },
    ];
    setServices(updatedServices);
  };

  const removePackage = (serviceIdx: number, pkgIdx: number) => {
    const updatedServices = [...services];
    updatedServices[serviceIdx].packages = updatedServices[
      serviceIdx
    ].packages?.filter((_, i) => i !== pkgIdx);
    setServices(updatedServices);
  };

  const handlePackageChange = (
    serviceIdx: number,
    pkgIdx: number,
    field: keyof ServicePackage,
    value: string
  ) => {
    const updatedServices = [...services];
    const packages = [...(updatedServices[serviceIdx].packages || [])];
    packages[pkgIdx] = { ...packages[pkgIdx], [field]: value };
    updatedServices[serviceIdx].packages = packages;
    setServices(updatedServices);
  };

  const handleSubmit = () => {
    const validServices = services
      .map((srv) => ({
        name: srv.name.trim(),
        description: srv.description.trim(),
        baseFee: srv.baseFee?.trim() || "",
        additionalCosts: srv.additionalCosts?.trim() || "",
        packages: srv.packages || [],
      }))
      .filter(
        (srv) =>
          srv.name &&
          srv.description &&
          srv.baseFee &&
          srv.additionalCosts &&
          srv.packages.length > 0 &&
          srv.packages.every(
            (pkg) =>
              pkg.name.trim() &&
              pkg.price.trim() &&
              pkg.description.trim() &&
              pkg.additionalCosts.trim()
          )
      );

    if (validServices.length === 0) {
      dispatch(
        showToast({
          message:
            "Please complete all required fields and at least one valid package.",
          type: "error",
        })
      );
      return;
    }

    setServices(validServices);
    dispatch(showToast({ message: "Services Saved!", type: "success" }));
    onClose();
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 text-white">
      {/* Stepper */}
      <div className="flex justify-center gap-12 mb-10">
        {[1, 2].map((s) => (
          <div key={s} className="flex flex-col items-center">
            <button
              onClick={() =>
                (s === 1 || isServiceComplete(services[activeServiceIdx])) &&
                setStep(s)
              }
              disabled={
                s === 2 && !isServiceComplete(services[activeServiceIdx])
              }
              className={`w-12 h-12 rounded-full border-2 font-bold text-lg flex items-center justify-center transition
                ${
                  step === s
                    ? "bg-teal-500 text-white border-teal-500 scale-110"
                    : "bg-gray-800 text-teal-300 border-teal-700 hover:bg-teal-700 hover:text-white"
                }
                ${
                  s === 2 && !isServiceComplete(services[activeServiceIdx])
                    ? "opacity-40 cursor-not-allowed"
                    : ""
                }
              `}
            >
              {s}
            </button>
            <span className="mt-2 text-sm text-gray-300">
              {s === 1 ? "Service Info" : "Packages"}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Service Form */}
      {step === 1 && (
        <>
          {services.map((srv, index) => (
            <div
              key={index}
              className={`mb-8 p-6 border relative transition-all duration-200 ${
                activeServiceIdx === index
                  ? "ring-2 ring-teal-400 bg-gray-950 rounded-2xl shadow-lg"
                  : "bg-gray-900 rounded-xl opacity-70 hover:ring-2 hover:ring-teal-300"
              }`}
              onClick={() => setActiveServiceIdx(index)}
            >
              <button
                className="absolute top-3 right-3 text-red-500 hover:text-red-700 bg-gray-800 rounded-full p-2 shadow"
                onClick={(e) => {
                  e.stopPropagation();
                  removeService(index);
                }}
              >
                <FaTimesCircle size={18} />
              </button>
              {activeServiceIdx === index ? (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-teal-300 mb-2">
                      Service Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={srv.name}
                      onChange={(e) => handleServiceChange(index, e)}
                      className={inputClass}
                      placeholder="Enter service name"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-teal-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={srv.description}
                      onChange={(e) => handleServiceChange(index, e)}
                      className={`${inputClass} resize-none`}
                      placeholder="Describe the service"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-teal-300 mb-2">
                        Base Fee *
                      </label>
                      <input
                        type="text"
                        name="baseFee"
                        value={srv.baseFee || ""}
                        onChange={(e) => handleServiceChange(index, e)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-teal-300 mb-2">
                        Additional Costs *
                      </label>
                      <input
                        type="text"
                        name="additionalCosts"
                        value={srv.additionalCosts || ""}
                        onChange={(e) => handleServiceChange(index, e)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-6">
                    <button
                      className={`px-6 py-3 rounded-lg font-semibold bg-teal-500 text-white shadow hover:bg-teal-600 transition-all duration-200 ${
                        !isServiceComplete(srv)
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isServiceComplete(srv)) setStep(2);
                      }}
                      disabled={!isServiceComplete(srv)}
                    >
                      Next: Manage Packages
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-gray-400">
                  <div>
                    <strong>Name:</strong> {srv.name || <em>(empty)</em>}
                  </div>
                  <div>
                    <strong>Description:</strong>{" "}
                    {srv.description || <em>(empty)</em>}
                  </div>
                </div>
              )}
            </div>
          ))}
          <button
            className="w-full py-3 rounded-lg font-semibold bg-teal-500 text-white shadow-lg hover:bg-teal-600 transition-all duration-200"
            onClick={addService}
          >
            + Add Service
          </button>
        </>
      )}

      {/* Step 2: Packages */}
      {step === 2 && (
        <>
          {services[activeServiceIdx] ? (
            <div className="bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-white">
                  Manage Packages
                </h2>
                <button
                  onClick={() => setStep(1)}
                  className="text-sm px-4 py-2 bg-gray-700 rounded hover:bg-gray-800 text-teal-300 hover:text-white transition"
                >
                  Back
                </button>
              </div>
              <div className="mb-2 text-gray-300">
                <strong>Service:</strong> {services[activeServiceIdx].name}
              </div>
              {(services[activeServiceIdx].packages || []).map(
                (pkg, pkgIdx) => (
                  <div
                    key={pkgIdx}
                    className="bg-gray-950 p-4 rounded-xl mb-4 border border-gray-800"
                  >
                    <div className="mb-3">
                      <label className="text-sm block text-teal-300 mb-1">
                        Package Name *
                      </label>
                      <input
                        type="text"
                        value={pkg.name}
                        onChange={(e) =>
                          handlePackageChange(
                            activeServiceIdx,
                            pkgIdx,
                            "name",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Package name"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="text-sm block text-teal-300 mb-1">
                        Additional Costs *
                      </label>
                      <input
                        type="text"
                        value={pkg.additionalCosts}
                        onChange={(e) =>
                          handlePackageChange(
                            activeServiceIdx,
                            pkgIdx,
                            "additionalCosts",
                            e.target.value
                          )
                        }
                        className={inputClass}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="text-sm block text-teal-300 mb-1">
                        Price *
                      </label>
                      <input
                        type="text"
                        value={pkg.price}
                        onChange={(e) =>
                          handlePackageChange(
                            activeServiceIdx,
                            pkgIdx,
                            "price",
                            e.target.value
                          )
                        }
                        className={inputClass}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="text-sm block text-teal-300 mb-1">
                        Description *
                      </label>
                      <textarea
                        value={pkg.description}
                        onChange={(e) =>
                          handlePackageChange(
                            activeServiceIdx,
                            pkgIdx,
                            "description",
                            e.target.value
                          )
                        }
                        className={`${inputClass} resize-none`}
                        rows={2}
                        placeholder="Short description"
                      />
                    </div>
                    <button
                      onClick={() => removePackage(activeServiceIdx, pkgIdx)}
                      className="text-sm text-red-400 hover:underline mt-1"
                    >
                      Remove Package
                    </button>
                  </div>
                )
              )}
              <button
                className="w-full py-3 rounded-lg font-semibold bg-teal-500 text-white shadow-lg hover:bg-teal-600 transition-all duration-200"
                onClick={() => addPackage(activeServiceIdx)}
              >
                + Add Package
              </button>
              <div className="flex justify-end mt-6">
                <button
                  className="px-6 py-3 rounded-lg font-semibold bg-teal-500 text-white shadow hover:bg-teal-600 transition-all duration-200"
                  onClick={handleSubmit}
                >
                  Save Services
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              No active service selected.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ServicesForm;
