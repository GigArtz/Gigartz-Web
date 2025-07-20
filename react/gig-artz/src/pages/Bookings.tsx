import React from "react";
import Header from "../components/Header";
import BookingsComponent from "../components/BookingsComponent";

function Bookings() {
  return (
    <div className="main-content p-4">
      <Header title="Bookings" />
      <BookingsComponent showStats={true} compact={true} />
    </div>
  );
}

export default Bookings;
