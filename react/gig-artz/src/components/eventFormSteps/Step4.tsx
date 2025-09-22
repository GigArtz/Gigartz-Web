import React, { useState } from "react";
import ErrorMessage from "../ErrorMessage";

type TicketErrors = {
  ticketType?: string;
  price?: string;
  quantity?: string;
  ticketInfo?: string;
  ticketReleaseDate?: string;
  ticketReleaseTime?: string;
};

interface Ticket {
  price: string;
  quantity: string;
  ticketInfo: string;
  ticketReleaseDate: string;
  ticketReleaseTime: string;
}

interface FormData {
  ticketsAvailable: Record<string, Ticket>;
}

type FormAction =
  | { type: "addTicket"; ticketType: string; ticket: Ticket }
  | { type: "removeTicket"; ticketType: string };

interface Step4Props {
  formData: FormData;
  dispatch: React.Dispatch<FormAction>;
  errors: Record<string, string>;
}

const Step4: React.FC<Step4Props> = ({ formData, dispatch, errors }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTicketType, setNewTicketType] = useState("");
  const [newTicket, setNewTicket] = useState<Ticket>({
    price: "",
    quantity: "",
    ticketInfo: "",
    ticketReleaseDate: "",
    ticketReleaseTime: "",
  });
  const [ticketErrors, setTicketErrors] = useState<TicketErrors>({});

  const handleNewTicketChange = (field: keyof Ticket, value: string) => {
    setNewTicket((prev) => ({ ...prev, [field]: value }));

    // Clear specific error when user starts typing
    if (ticketErrors[field]) {
      setTicketErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateTicket = (): TicketErrors => {
    const errors: TicketErrors = {};

    if (!newTicketType.trim()) errors.ticketType = "Ticket type is required";
    if (!newTicket.price || parseFloat(newTicket.price) <= 0)
      errors.price = "Valid price is required";
    if (!newTicket.quantity || parseInt(newTicket.quantity) <= 0)
      errors.quantity = "Valid quantity is required";
    if (!newTicket.ticketInfo.trim())
      errors.ticketInfo = "Ticket information is required";
    if (!newTicket.ticketReleaseDate)
      errors.ticketReleaseDate = "Release date is required";
    if (!newTicket.ticketReleaseTime)
      errors.ticketReleaseTime = "Release time is required";

    // Check if ticket type already exists
    if (formData.ticketsAvailable[newTicketType]) {
      errors.ticketType = "This ticket type already exists";
    }

    return errors;
  };

  const addTicketType = () => {
    const errors = validateTicket();
    setTicketErrors(errors);

    if (Object.keys(errors).length === 0) {
      dispatch({
        type: "addTicket",
        ticketType: newTicketType,
        ticket: newTicket,
      });

      setNewTicketType("");
      setNewTicket({
        price: "",
        quantity: "",
        ticketInfo: "",
        ticketReleaseDate: "",
        ticketReleaseTime: "",
      });
      setTicketErrors({});
      setIsAdding(false);
    }
  };

  const removeTicketType = (ticketType: string) => {
    dispatch({ type: "removeTicket", ticketType });
  };

  return (
    <div className="space-y-4 rounded-lg p-6">
      {Object.keys(formData.ticketsAvailable).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Current Tickets</h3>
          {Object.entries(formData.ticketsAvailable).map(
            ([ticketType, ticket]) => (
              <div
                key={ticketType}
                className="bg-gray-800 border border-gray-600 rounded-lg p-4"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-white font-medium">{ticketType}</h4>
                    <p className="text-gray-400 text-sm">{ticket.ticketInfo}</p>
                  </div>
                  <button
                    onClick={() => removeTicketType(ticketType)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      <ErrorMessage error={errors.tickets} />

      {/* Add New Ticket Section */}
      {isAdding ? (
        <div className="bg-gray-700 rounded-lg p-4 space-y-3">
          <div>
            <input
              type="text"
              placeholder="Enter Ticket Type (e.g., General, VIP, Early Bird)"
              value={newTicketType}
              onChange={(e) => setNewTicketType(e.target.value)}
              className={`input-field ${
                ticketErrors.ticketType ? "border-red-500" : ""
              }`}
            />
            <ErrorMessage error={ticketErrors.ticketType} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <input
                type="number"
                placeholder="Price"
                value={newTicket.price}
                onChange={(e) => handleNewTicketChange("price", e.target.value)}
                className={`input-field ${
                  ticketErrors.price ? "border-red-500" : ""
                }`}
              />
              <ErrorMessage error={ticketErrors.price} />
            </div>

            <div>
              <input
                type="number"
                placeholder="Quantity"
                value={newTicket.quantity}
                onChange={(e) =>
                  handleNewTicketChange("quantity", e.target.value)
                }
                className={`input-field ${
                  ticketErrors.quantity ? "border-red-500" : ""
                }`}
              />
              <ErrorMessage error={ticketErrors.quantity} />
            </div>
          </div>

          <div>
            <textarea
              placeholder="Describe what's included with this ticket"
              value={newTicket.ticketInfo}
              onChange={(e) =>
                handleNewTicketChange("ticketInfo", e.target.value)
              }
              className={`input-field ${
                ticketErrors.ticketInfo ? "border-red-500" : ""
              }`}
              rows={2}
            />
            <ErrorMessage error={ticketErrors.ticketInfo} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <input
                type="date"
                placeholder="Release Date"
                value={newTicket.ticketReleaseDate}
                onChange={(e) =>
                  handleNewTicketChange("ticketReleaseDate", e.target.value)
                }
                className={`input-field ${
                  ticketErrors.ticketReleaseDate ? "border-red-500" : ""
                }`}
              />
              <ErrorMessage error={ticketErrors.ticketReleaseDate} />
            </div>

            <div>
              <input
                type="time"
                placeholder="Release Time"
                value={newTicket.ticketReleaseTime}
                onChange={(e) =>
                  handleNewTicketChange("ticketReleaseTime", e.target.value)
                }
                className={`input-field ${
                  ticketErrors.ticketReleaseTime ? "border-red-500" : ""
                }`}
              />
              <ErrorMessage error={ticketErrors.ticketReleaseTime} />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              onClick={addTicketType}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all duration-300"
            >
              Add Ticket
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center px-6 py-3 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-all duration-300"
          >
            + Add Ticket Type
          </button>
        </div>
      )}
    </div>
  );
};

export default Step4;
