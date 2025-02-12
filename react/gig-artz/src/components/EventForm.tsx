import React, { useState, useRef } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const AddEventForm: React.FC = () => {
  // Step state to track the current step of the form
  const [step, setStep] = useState(1);

  // State to track form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    venue: "",
    city: "",
    eventType: "",
    category: "",
    artistLineUp: "",
    generalPrice: "",
    studentPrice: "",
    goldenCirclePrice: "",
    platinumPrice: "",
    mapLink: "",
    eventPic: null,
    eventVideo: null,
    startTime: "",
    endTime: "",
  });

  // Use refs to persist input values and avoid unnecessary re-renders
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const venueRef = useRef<HTMLInputElement>(null);
  const eventTypeRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLInputElement>(null);
  const artistLineUpRef = useRef<HTMLInputElement>(null);
  const generalPriceRef = useRef<HTMLInputElement>(null);
  const studentPriceRef = useRef<HTMLInputElement>(null);
  const goldenCirclePriceRef = useRef<HTMLInputElement>(null);
  const platinumPriceRef = useRef<HTMLInputElement>(null);
  const mapLinkRef = useRef<HTMLInputElement>(null);
  const eventPicRef = useRef<HTMLInputElement>(null);
  const eventVideoRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<HTMLInputElement>(null);
  const endTimeRef = useRef<HTMLInputElement>(null);

  // Handle next step
  const handleNext = () => {
    // Validate form data before moving to next step
    if (step === 1 && !titleRef.current?.value) {
      alert("Please enter an event title.");
      return;
    }
    if (step === 1 && !descriptionRef.current?.value) {
      alert("Please enter an event description.");
      return;
    }
    if (step === 1 && !venueRef.current?.value) {
      alert("Please enter an event venue.");
      return;
    }
    if (step === 2 && !eventTypeRef.current?.value) {
      alert("Please select an event type.");
      return;
    }
    if (step === 2 && !categoryRef.current?.value) {
      alert("Please select a category.");
      return;
    }
    // Set form data for each step
    setFormData({
      ...formData,
      title: titleRef.current?.value || "",
      description: descriptionRef.current?.value || "",
      date: dateRef.current?.value || "",
      venue: venueRef.current?.value || "",
      city: cityRef.current?.value || "",
      eventType: eventTypeRef.current?.value || "",
      category: categoryRef.current?.value || "",
      artistLineUp: artistLineUpRef.current?.value || "",
      generalPrice: generalPriceRef.current?.value || "",
      studentPrice: studentPriceRef.current?.value || "",
      goldenCirclePrice: goldenCirclePriceRef.current?.value || "",
      platinumPrice: platinumPriceRef.current?.value || "",
      mapLink: mapLinkRef.current?.value || "",
      eventPic: eventPicRef.current?.files?.[0] ?? null,
      eventVideo: eventVideoRef.current?.files?.[0] ?? null,
      startTime: startTimeRef.current?.value || "",
      endTime: endTimeRef.current?.value || "",
    });

    setStep((prevStep) => prevStep + 1);
  };

  // Handle previous step
  const handlePrevious = () => setStep((prevStep) => prevStep - 1);

  // Handle form submission
  const handleSubmit = () => {
    if (
      !formData.title ||
      !formData.description ||
      !formData.date ||
      !formData.venue
    ) {
      alert("Please fill in all required fields.");
      return;
    }
    // Process form submission (e.g., send data to the server)
    console.log("Form Submitted", formData);
    alert("Event Submitted Successfully!");
  };

  // Step 1: Event details form
  const Step1 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-white">Event Title</label>
        <input
          type="text"
          ref={titleRef}
          className="mt-2 p-3 w-full rounded-lg bg-gray-700 text-white"
        />
      </div>
      <div>
        <label className="block text-white">Event Description</label>
        <textarea
          ref={descriptionRef}
          className="mt-2 p-3 w-full rounded-lg bg-gray-700 text-white"
        />
      </div>
      <div>
        <label className="block text-white">Event Date</label>
        <input
          type="date"
          ref={dateRef}
          className="mt-2 p-3 w-full rounded-lg bg-gray-700 text-white"
        />
      </div>
      <div>
        <label className="block text-white">Venue</label>
        <input
          type="text"
          ref={venueRef}
          className="mt-2 p-3 w-full rounded-lg bg-gray-700 text-white"
        />
      </div>
      <div>
        <label className="block text-white">City</label>
        <input
          type="text"
          ref={cityRef}
          className="mt-2 p-3 w-full rounded-lg bg-gray-700 text-white"
        />
      </div>
    </div>
  );

  // Step 2: Event Type, Category, and Artist lineup
  const Step2 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-white">Event Type</label>
        <input
          type="text"
          ref={eventTypeRef}
          className="mt-2 p-3 w-full rounded-lg bg-gray-700 text-white"
        />
      </div>
      <div>
        <label className="block text-white">Category</label>
        <input
          type="text"
          ref={categoryRef}
          className="mt-2 p-3 w-full rounded-lg bg-gray-700 text-white"
        />
      </div>
      <div>
        <label className="block text-white">
          Artist Lineup (comma-separated)
        </label>
        <input
          type="text"
          ref={artistLineUpRef}
          className="mt-2 p-3 w-full rounded-lg bg-gray-700 text-white"
          placeholder="Enter artist names separated by commas"
        />
      </div>
    </div>
  );

  // Step 3: Ticket Prices
  const Step3 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-white">General Ticket Price</label>
        <input
          type="number"
          ref={generalPriceRef}
          className="mt-2 p-3 w-full rounded-lg bg-gray-700 text-white"
        />
      </div>
      <div>
        <label className="block text-white">Student Ticket Price</label>
        <input
          type="number"
          ref={studentPriceRef}
          className="mt-2 p-3 w-full rounded-lg bg-gray-700 text-white"
        />
      </div>
      <div>
        <label className="block text-white">Golden Circle Price</label>
        <input
          type="number"
          ref={goldenCirclePriceRef}
          className="mt-2 p-3 w-full rounded-lg bg-gray-700 text-white"
        />
      </div>
      <div>
        <label className="block text-white">Platinum Ticket Price</label>
        <input
          type="number"
          ref={platinumPriceRef}
          className="mt-2 p-3 w-full rounded-lg bg-gray-700 text-white"
        />
      </div>
    </div>
  );

  // Step 4: Upload Images, Video, and Map Link
  const Step4 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-white">Event Map Link</label>
        <input
          type="url"
          ref={mapLinkRef}
          className="mt-2 p-3 w-full rounded-lg bg-gray-700 text-white"
        />
      </div>
      <div>
        <label className="block text-white">Event Image</label>
        <input
          type="file"
          ref={eventPicRef}
          className="mt-2 p-3 w-full rounded-lg bg-gray-700 text-white"
        />
      </div>
      <div>
        <label className="block text-white">Event Video</label>
        <input
          type="file"
          ref={eventVideoRef}
          className="mt-2 p-3 w-full rounded-lg bg-gray-700 text-white"
        />
      </div>
      <div>
        <label className="block text-white">Event Start Time</label>
        <input
          type="time"
          ref={startTimeRef}
          className="mt-2 p-3 w-full rounded-lg bg-gray-700 text-white"
        />
      </div>
      <div>
        <label className="block text-white">Event End Time</label>
        <input
          type="time"
          ref={endTimeRef}
          className="mt-2 p-3 w-full rounded-lg bg-gray-700 text-white"
        />
      </div>
    </div>
  );

  // Step 5: Confirm and Submit
  const Step5 = () => (
    <div className="space-y-4">
      <h2 className="text-white text-2xl">Confirm Your Event Details</h2>
      <div className="space-y-2">
        <p className="text-white">Title: {formData.title}</p>
        <p className="text-white">Description: {formData.description}</p>
        <p className="text-white">Start Time: {formData.startTime}</p>
        <p className="text-white">End Time: {formData.endTime}</p>
        <p className="text-white">Venue: {formData.venue}</p>
        <p className="text-white">City: {formData.city}</p>
      </div>
      <button
        onClick={handleSubmit}
        className="mt-4 p-3 bg-blue-500 text-white rounded-lg"
      >
        Submit Event
      </button>
    </div>
  );

  return (
    <div className="justify-center items-center z-20">
      <div className="flex-row p-8 space-y-6">
        <div className="flex justify-between">
          {step > 1 && (
            <button
              onClick={handlePrevious}
              className="text-white flex items-center"
            >
              <FaArrowLeft className="mr-2" /> Previous
            </button>
          )}
          {step < 5 && (
            <button
              onClick={handleNext}
              className="text-white flex items-center"
            >
              Next <FaArrowRight className="ml-2" />
            </button>
          )}
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          {step === 1 && <Step1 />}
          {step === 2 && <Step2 />}
          {step === 3 && <Step3 />}
          {step === 4 && <Step4 />}
          {step === 5 && <Step5 />}
        </div>
      </div>
    </div>
  );
};

export default AddEventForm;
