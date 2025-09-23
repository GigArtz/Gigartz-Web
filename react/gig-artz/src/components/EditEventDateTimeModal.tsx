import React, { useEffect, useState } from "react";
import BaseModal from "./BaseModal";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { updateEvent } from "../../store/eventsSlice";
import { showToast } from "../../store/notificationSlice";
import { AppDispatch } from "../../store/store";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  event: Record<string, unknown> | null;
}

const EditEventDateTimeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  event,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [date, setDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (event) {
      // Normalize incoming values
      const formatDate = (d: unknown) => {
        if (!d) return "";
        try {
          const asDate = new Date(String(d));
          if (!isNaN(asDate.getTime()))
            return asDate.toISOString().split("T")[0];
        } catch {
          // ignore
        }
        // If it's already YYYY-MM-DD
        return String(d).split("T")[0];
      };

      const formatTime = (t: unknown) => {
        if (!t) return "";
        const s = String(t);
        if (s.includes("T")) {
          return s.split("T")[1].slice(0, 5);
        }
        return s.slice(0, 5);
      };

      setDate(formatDate(event.date));
      setStartTime(formatTime(event.eventStartTime || event.time));
      setEndTime(formatTime(event.eventEndTime));
    } else {
      setDate("");
      setStartTime("");
      setEndTime("");
    }
  }, [event]);

  const handleSubmit = async () => {
    if (!event) return;
    // Basic validation
    if (!date) {
      dispatch(showToast({ message: "Please select a date", type: "error" }));
      return;
    }

    setLoading(true);

    try {
      // Build updated event object by merging existing event fields
      // and only changing the date/time fields (so other fields are preserved)
      const existingEvent = event as Record<string, unknown>;
      const updatedEvent = {
        ...existingEvent,
        date,
        eventStartTime:
          startTime ||
          (existingEvent.eventStartTime as string | undefined) ||
          (existingEvent.time as string | undefined),
        eventEndTime:
          endTime || (existingEvent.eventEndTime as string | undefined),
      } as Record<string, unknown>;

      // Extract promoterId safely
      const promoterId = (existingEvent.promoterId as string) || "";

      await dispatch(
        updateEvent(String(existingEvent.id), promoterId, updatedEvent)
      );

      dispatch(
        showToast({ message: "Event date/time updated", type: "success" })
      );
      onClose();
    } catch (err) {
      console.error("Failed to update event date/time", err);
      dispatch(showToast({ message: "Failed to update event", type: "error" }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Date & Time"
      icon={<FaCalendarAlt />}
      className="bg-dark p-0 rounded-xl overflow-hidden shadow-2xl"
      maxWidth="md:max-w-md"
    >
      <div className="p-4 text-white">
        <div className="mb-4">
          <label className="block text-sm mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 rounded bg-gray-800"
          />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm mb-1">Start Time</label>
            <div className="flex items-center gap-2">
              <FaClock />
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2 rounded bg-gray-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">End Time</label>
            <div className="flex items-center gap-2">
              <FaClock />
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-2 rounded bg-gray-800"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-600 rounded"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-teal-500 rounded"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default EditEventDateTimeModal;
