import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { buyTicket } from "../../store/eventsSlice";
import { AppDispatch } from "../../store/store";
import { FaCreditCard } from "react-icons/fa";
import BaseModal from "./BaseModal";

// Define the EventBooking type based on eventsSlice.ts
type EventBooking = {
  eventId: string;
  customerUid: string;
  customerName: string;
  customerEmail: string;
  ticketTypes: unknown[]; // This is what is used in the eventsSlice.ts
  location: string;
  eventName: string;
  eventDate: string;
  image: string;
};

interface PaymentProps {
  amount: number;
  type: "ticket" | "tip" | "booking";
  ticketDetails?: EventBooking;
  tipDetails?: Record<string, unknown>;
  bookingDetails?: Record<string, unknown>;
  onSuccess: () => void;
  onFailure: () => void;
  onClose: () => void;
  isOpen: boolean;
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
  isOpen,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Don't make API request if component is not visible
    if (!isOpen) return;

    const payload: {
      amount: number;
      order?: unknown[];
      tip?: Record<string, unknown>;
      booking?: Record<string, unknown>;
      type: string;
    } = {
      amount,
      type,
    };

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
        // Clear previous data
        setUrl("");
        setError("");

        console.log("Payment payload:", payload);

        const response = await fetch(
          "https://peach-payment-backend.onrender.com/checkout",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        console.log("Payment response:", response);

        const textData = await response.text();
        let data;

        try {
          // Try to parse as JSON
          data = JSON.parse(textData);
          console.log("Payment response data:", data);
        } catch {
          console.error("Failed to parse response as JSON:", textData);
          throw new Error("Invalid response format from payment server");
        }

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch payment URL.");
        }

        if (!data.url) {
          throw new Error("Payment URL not found in response");
        }

        setUrl(data.url);
      } catch (error) {
        setError("Failed to initialize payment. Please try again.");
        console.error("Payment Error:", error);
      }
    };

    fetchPaymentUrl();
  }, [amount, type, ticketDetails, tipDetails, bookingDetails, isOpen]);

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
            try {
              console.log("Processing ticket purchase:", ticketDetails);
              // Using properly typed dispatch
              dispatch(buyTicket(ticketDetails));
              // Note: we call onSuccess even if the API call fails
              // since the payment was actually successful
            } catch (err) {
              console.error("Error processing ticket purchase:", err);
            }
          }
          onSuccess();
        } else {
          console.warn("Payment failed with code:", event.data.result.code);
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
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Payment - ${
        type ? type.charAt(0).toUpperCase() + type.slice(1) : "Processing"
      }`}
      subtitle={`Amount: R${amount.toFixed(2)}`}
      icon={<FaCreditCard className="w-5 h-5" />}
      maxWidth="md:max-w-2xl"
    >
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
    </BaseModal>
  );
};

export default Payment;
