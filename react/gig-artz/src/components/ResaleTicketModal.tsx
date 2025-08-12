import React from "react";
import BaseModal from "./BaseModal";
import { FaUserAlt } from "react-icons/fa";

interface ResaleTicket {
  ticketType: string;
  price: number;
  daysUntilEvent: number;
  sellerId: string;
  resaleId: string;
}

interface SellerInfo {
  name?: string;
  email?: string;
}

interface ResaleTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: ResaleTicket[];
  getSellerInfo?: (sellerId: string) => SellerInfo | undefined;
  onSelect?: (resaleId: string) => void;
  selectedResaleId?: string;
}

const ResaleTicketModal: React.FC<ResaleTicketModalProps> = ({
  isOpen,
  onClose,
  tickets,
  getSellerInfo,
  onSelect,
  selectedResaleId,
}) => {
  if (!tickets || tickets.length === 0) return null;
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Resale Tickets"
      icon={<FaUserAlt />}
      maxWidth="max-w-full sm:max-w-2xl"
      minWidth="min-w-0 sm:min-w-[400px]"
    >
      <ul className="flex flex-col gap-3">
        {tickets.map((ticket) => {
          const seller = getSellerInfo
            ? getSellerInfo(ticket.sellerId)
            : undefined;
          return (
            <li
              key={ticket.resaleId}
              className={`bg-gray-800 rounded-lg p-3 flex flex-col gap-1 border border-orange-400 shadow-sm ${
                ticket.resaleId ===
                (typeof selectedResaleId === "string"
                  ? selectedResaleId
                  : undefined)
                  ? "ring-2 ring-orange-400"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-orange-300 font-bold text-base">
                  {ticket.ticketType}
                </span>
                <span className="text-white font-semibold text-lg">
                  R {ticket.price}
                </span>
              </div>
              <div className="text-xs text-orange-200 mb-1">
                {ticket.daysUntilEvent} days until event
              </div>
              <div className="flex items-center gap-2 text-teal-400 text-xs">
                <FaUserAlt /> Seller
              </div>
              <div className="text-white text-xs">ID: {ticket.sellerId}</div>
              {seller?.name && (
                <div className="text-white text-xs">Name: {seller.name}</div>
              )}
              {seller?.email && (
                <div className="text-white text-xs">Email: {seller.email}</div>
              )}
              <button
                className={`mt-2 px-3 py-1 rounded bg-orange-500 hover:bg-orange-400 text-white text-xs font-semibold transition-all ${
                  ticket.resaleId ===
                  (typeof selectedResaleId === "string"
                    ? selectedResaleId
                    : undefined)
                    ? "opacity-70"
                    : ""
                }`}
                onClick={() => {
                  if (!onSelect) return;
                  if (
                    ticket.resaleId ===
                    (typeof selectedResaleId === "string"
                      ? selectedResaleId
                      : undefined)
                  ) {
                    onSelect(undefined);
                  } else {
                    onSelect(ticket.resaleId);
                  }
                }}
              >
                {ticket.resaleId ===
                (typeof selectedResaleId === "string"
                  ? selectedResaleId
                  : undefined)
                  ? "Unselect"
                  : "Select"}
              </button>
            </li>
          );
        })}
      </ul>
    </BaseModal>
  );
};

export default ResaleTicketModal;
