import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { buyTicket } from "../store/eventsSlice";
import { FaTimesCircle } from "react-icons/fa";

interface PaymentProps {
  amount: number;
  ticketDetails: any;
  onSuccess: () => void;
  onFailure: () => void;
  onClose: () => void;
}

const Payment: React.FC<PaymentProps> = ({
  amount,
  ticketDetails,
  onSuccess,
  onFailure,
  onClose,
}) => {
  const dispatch = useDispatch();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!ticketDetails || !ticketDetails.ticketTypes || ticketDetails.ticketTypes.length === 0) {
      setError("Please select at least one ticket type.");
      return;
    }

    const fetchPaymentUrl = async () => {
      try {
        const response = await fetch(
          "https://peach-payment-backend.onrender.com/checkout",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount, order: ticketDetails.ticketTypes }),
          }
        );

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
  }, [amount, ticketDetails]);

  useEffect(() => {
    const checkIframeStatus = () => {
      if (!iframeRef.current) return;

      try {
        const iframeDocument =
          iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;

        if (iframeDocument) {
          const paymentStatusElement = iframeDocument.querySelector("#payment-form");
          
          
          if (paymentStatusElement) {
            const status = paymentStatusElement.textContent?.trim();
            console.log("Payment Status:", status);

            if (status === "Paid!") {
              dispatch(buyTicket(ticketDetails));
              onSuccess();
            } else if (["Cancelled!", "Expired!"].includes(status)) {
              onFailure();
            }
          }
        }
      } catch (error) {
        console.error("Error accessing iframe:", error);
      }
    };

    const interval = setInterval(checkIframeStatus, 3000); // Poll every 3 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, [dispatch, ticketDetails, onSuccess, onFailure]);

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
          <p className="text-lg">Loading payment gateway...</p>
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
