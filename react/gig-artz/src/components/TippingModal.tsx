import React, { useState } from "react";
import { FaTimesCircle } from "react-icons/fa";

interface TippingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => void;
}

const TippingModal: React.FC<TippingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number | "">(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAmount && selectedAmount > 0) {
      onSubmit(Number(selectedAmount));
      setSelectedAmount(10); // Reset to default
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-dark rounded-lg shadow-lg w-11/12 max-w-md p-4">
        <form onSubmit={handleSubmit} className="p-4">
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-4 pb-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Tip Freelancer
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
            >
              <FaTimesCircle className="w-6 h-6 hover:text-red-500" />
            </button>
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Select an amount:</p>
            <div className="flex gap-2 flex-wrap">
              {[10, 20, 50, 100, 200].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setSelectedAmount(amount)}
                  className={`px-4 py-2 border border-teal-500 rounded ${
                    selectedAmount === amount
                      ? "bg-teal-400 text-white"
                      : "border border-teal-500"
                  }`}
                >
                  R{amount}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Custom Amount</label>
            <input
              type="number"
              min="1"
              value={selectedAmount === "" ? "" : selectedAmount}
              onChange={(e) =>
                setSelectedAmount(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="input-field"
              placeholder="Enter custom amount"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="submit" className="btn-primary">
              Tip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TippingModal;
