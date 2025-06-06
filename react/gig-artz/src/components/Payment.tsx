import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { buyTicket } from "../../store/eventsSlice";
import type { EventBooking } from "../../store/eventsSlice";
import { FaTimesCircle } from "react-icons/fa";
import Loader from "./Loader";

interface PaymentProps {
  amount: number;
  type: "ticket" | "tip" | "booking";
  ticketDetails?: EventBooking;
  tipDetails?: Record<string, unknown>;
  bookingDetails?: Record<string, unknown>;
  onSuccess: () => void;
  onFailure: () => void;
  onClose: () => void;
}

const Payment: React.FC<PaymentProps> = ({
  amount,
  type,
  ticketDetails,
  tipDetails,
  bookingDetails,
  onSuccess,
  onFailure,
  onClose,
}) => {
  const dispatch = useDispatch();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const payload: {
      amount: number;
      order?: unknown[];
      tip?: Record<string, unknown>;
      booking?: Record<string, unknown>;
    } = { amount };
    if (type === "ticket") {
      if (
        !ticketDetails ||
        !ticketDetails.ticketTypes ||
        ticketDetails.ticketTypes.length === 0
      ) {
        setError("Please select at least one ticket type.");
        return;
      }
      payload.order = ticketDetails.ticketTypes;
    } else if (type === "tip") {
      if (!tipDetails) {
        setError("Tip details missing.");
        return;
      }
      payload.tip = tipDetails;
    } else if (type === "booking") {
      if (!bookingDetails) {
        setError("Booking details missing.");
        return;
      }
      payload.booking = bookingDetails;
    }

    const fetchPaymentUrl = async () => {
      try {
        const response = await fetch(
          "https://peach-payment-backend.onrender.com/checkout",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        console.log(response);

        if (!response.ok) {
          throw new Error("Failed to fetch payment URL.");
        }

        const data = await response.json();
        setUrl(data.url);
      } catch (error) {
        setError("Failed to initialize payment. Please try again.");
        console.error("Payment Error:", error);
      }
    };

    fetchPaymentUrl();
  }, [amount, type, ticketDetails, tipDetails, bookingDetails]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Optionally, check event.origin for security
      if (event.data && typeof event.data === "object" && event.data.result) {
        // Log the full object for debugging
        console.log("Payment postMessage:", event.data);
        // Example: check for successful payment
        if (
          event.data.result.code &&
          event.data.result.code.startsWith("000.100")
        ) {
          if (type === "ticket" && ticketDetails) {
            dispatch(buyTicket(ticketDetails));
          }
          onSuccess();
        } else {
          onFailure();
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [onSuccess, onFailure, type, ticketDetails, dispatch]);

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-dark rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-red-500 flex items-center"
        >
          <FaTimesCircle className="w-4 h-4" />
        </button>

        {error ? (
          <div>
            <h2 className="text-xl font-bold text-red-500">Error</h2>
            <p className="mt-4">{error}</p>
          </div>
        ) : !url ? (
          <div>
            <h2 className="text-xl font-bold text-teal-500">Initializing...</h2>
            <p className="mt-4">Please wait while we set up your payment.</p>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={url}
            title="Payment"
            className="w-full h-96 rounded-lg border"
            sandbox="allow-scripts allow-same-origin allow-forms"
          ></iframe>
        )}
      </div>
    </div>
  );
};

export default Payment;
