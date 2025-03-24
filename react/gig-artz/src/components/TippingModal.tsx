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
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>
        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold mb-4">Tip Freelancer</h2>
            <button
              type="button"
              onClick={onClose}
              className="px-2 py-2 rounded hover:bg-red-500"
            >
              <FaTimesCircle className="w-4 h-4" />
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
