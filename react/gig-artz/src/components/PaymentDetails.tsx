import React, { useState } from "react";

interface Card {
  id: string;
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
}

const PaymentDetails: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [form, setForm] = useState({
    cardNumber: "",
    cardHolder: "",
    expiry: "",
    cvv: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ cardNumber: "", cardHolder: "", expiry: "", cvv: "" });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      // Edit existing card
      setCards((prev) =>
        prev.map((card) =>
          card.id === editingId ? { ...card, ...form } : card
        )
      );
    } else {
      // Add new card
      setCards((prev) => [
        ...prev,
        { id: crypto.randomUUID(), ...form },
      ]);
    }
    resetForm();
  };

  const handleEdit = (id: string) => {
    const card = cards.find((c) => c.id === id);
    if (card) {
      setForm({
        cardNumber: card.cardNumber,
        cardHolder: card.cardHolder,
        expiry: card.expiry,
        cvv: card.cvv,
      });
      setEditingId(id);
    }
  };

  const handleRemove = (id: string) => {
    setCards((prev) => prev.filter((card) => card.id !== id));
    if (editingId === id) resetForm();
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h3 className="text-xl font-semibold mb-4">Payment Details</h3>
      <p className="mb-6 text-gray-400">
        Add, edit, or remove bank card information.
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4 bg-gray-800 p-6 rounded-lg shadow-md">
        <div>
          <label className="block text-gray-300 mb-1" htmlFor="cardNumber">Card Number</label>
          <input
            id="cardNumber"
            name="cardNumber"
            value={form.cardNumber}
            onChange={handleChange}
            required
            maxLength={19}
            placeholder="1234 5678 9012 3456"
            className="w-full rounded px-3 py-2 bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-teal-400"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-1" htmlFor="cardHolder">Cardholder Name</label>
          <input
            id="cardHolder"
            name="cardHolder"
            value={form.cardHolder}
            onChange={handleChange}
            required
            placeholder="John Doe"
            className="w-full rounded px-3 py-2 bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-teal-400"
          />
        </div>

        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-gray-300 mb-1" htmlFor="expiry">Expiry (MM/YY)</label>
            <input
              id="expiry"
              name="expiry"
              value={form.expiry}
              onChange={handleChange}
              required
              placeholder="12/34"
              maxLength={5}
              className="w-full rounded px-3 py-2 bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-teal-400"
            />
          </div>
          <div className="flex-1">
            <label className="block text-gray-300 mb-1" htmlFor="cvv">CVV</label>
            <input
              id="cvv"
              name="cvv"
              value={form.cvv}
              onChange={handleChange}
              required
              maxLength={4}
              placeholder="123"
              className="w-full rounded px-3 py-2 bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-teal-400"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-teal-500 hover:bg-teal-600 transition py-2 rounded text-white font-semibold"
        >
          {editingId ? "Update Card" : "Add Card"}
        </button>
      </form>

      {/* Cards List */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
        {cards.length === 0 && (
          <p className="text-gray-400">No cards added yet.</p>
        )}

        {cards.map(({ id, cardNumber, cardHolder, expiry }) => (
          <div
            key={id}
            className="bg-gray-800 rounded-lg p-4 shadow-md relative"
          >
            <div className="mb-4">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                Card Number
              </p>
              <p className="text-white font-mono text-lg tracking-widest">
                {/* Mask all but last 4 digits */}
                {cardNumber
                  .replace(/\s+/g, "")
                  .replace(/.(?=.{4})/g, "*")
                  .replace(/(.{4})/g, "$1 ")
                  .trim()}
              </p>
            </div>

            <div className="mb-2">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                Cardholder
              </p>
              <p className="text-white">{cardHolder}</p>
            </div>

            <div className="mb-2">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                Expiry
              </p>
              <p className="text-white">{expiry}</p>
            </div>

            <div className="absolute top-2 right-2 flex space-x-2">
              <button
                onClick={() => handleEdit(id)}
                className="px-2 py-1 bg-teal-500 hover:bg-teal-600 rounded text-xs text-white"
                aria-label="Edit card"
              >
                Edit
              </button>
              <button
                onClick={() => handleRemove(id)}
                className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs text-white"
                aria-label="Remove card"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentDetails;
