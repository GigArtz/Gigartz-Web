import React, { useState } from "react";
import { FaMoneyBillAlt } from "react-icons/fa";
import Payment from "./Payment";
import BaseModal from "./BaseModal";

interface TippingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (amount: number) => void;
}

const TippingModal: React.FC<TippingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number | "">(100);
  const [showPayment, setShowPayment] = useState(false);

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    if (onSubmit && selectedAmount) {
      onSubmit(Number(selectedAmount));
    }
    // Optionally show a success message
  };

  const handlePaymentFailure = () => {
    setShowPayment(false);
    // Optionally show an error message
  };

  const handleTipClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAmount && selectedAmount > 0) {
      setShowPayment(true);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Tip Freelancer"
      icon={<FaMoneyBillAlt />}
      maxWidth="md:max-w-md"
    >
      <form onSubmit={handleTipClick} className="p-4">
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
        <Payment
          isOpen={showPayment}
          amount={selectedAmount === "" ? 0 : Number(selectedAmount)}
          type="tip"
          tipDetails={{
            amount: selectedAmount === "" ? 0 : Number(selectedAmount),
          }}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
          onClose={() => setShowPayment(false)}
        />
      </form>
    </BaseModal>
  );
};

export default TippingModal;
