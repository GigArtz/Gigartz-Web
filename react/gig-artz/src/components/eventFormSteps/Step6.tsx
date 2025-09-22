import React from "react";

interface Ticket {
  quantity: number;
  price: number;
}

interface Step6Props {
  formData: {
    title: string;
    description: string;
    date: string;
    eventStartTime: string;
    eventEndTime: string;
    venue: string;
    eventType: string;
    artistLineUp?: string[];
    ticketsAvailable?: Record<string, Ticket>;
    galleryFiles?: File[];
  };
}

const Step6: React.FC<Step6Props> = ({ formData }) => (
  <div className="space-y-4">
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
      {/* Event Header */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white mb-2">{formData.title}</h2>
        <p className="text-gray-300 text-sm">{formData.description}</p>
      </div>

      {/* Event Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h3 className="text-white font-medium">Date</h3>
          <p className="text-gray-400">{formData.date}</p>
        </div>
        <div>
          <h3 className="text-white font-medium">Time</h3>
          <p className="text-gray-400">
            {formData.eventStartTime} - {formData.eventEndTime}
          </p>
        </div>
        <div>
          <h3 className="text-white font-medium">Venue</h3>
          <p className="text-gray-400">{formData.venue}</p>
        </div>
        <div>
          <h3 className="text-white font-medium">Event Type</h3>
          <p className="text-gray-400">{formData.eventType}</p>
        </div>
      </div>

      {/* Artist Lineup */}
      {formData.artistLineUp && formData.artistLineUp.length > 0 && (
        <div className="bg-gray-700 rounded-lg p-3 mb-4">
          <h3 className="text-white font-medium mb-2">Artist Lineup</h3>
          <ul className="list-disc list-inside text-gray-400">
            {formData.artistLineUp.map((artist, index) => (
              <li key={index}>{artist}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Tickets */}
      {formData.ticketsAvailable &&
        Object.keys(formData.ticketsAvailable).length > 0 && (
          <div className="bg-gray-700 rounded-lg p-3">
            <h3 className="text-white font-medium mb-2">Tickets</h3>
            <ul className="list-disc list-inside text-gray-400">
              {Object.entries(formData.ticketsAvailable).map(
                ([ticketType, ticket], index) => (
                  <li key={index}>
                    {ticketType}: {ticket.quantity} available at ${ticket.price}
                  </li>
                )
              )}
            </ul>
          </div>
        )}

      {/* Gallery */}
      {formData.galleryFiles && formData.galleryFiles.length > 0 && (
        <div className="bg-gray-700 rounded-lg p-3">
          <h3 className="text-white font-medium mb-2">Gallery</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {formData.galleryFiles.map((file, index) => (
              <img
                key={index}
                src={URL.createObjectURL(file)}
                alt={`Gallery ${index}`}
                className="rounded-lg w-full h-32 object-cover"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

export default Step6;
