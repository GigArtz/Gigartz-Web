import React from "react";
import Header from "../components/Header";
import BookingsComponent from "../components/BookingsComponent";

function Bookings() {
  return (
    <div className="main-content h-screen">
      <Header title="Bookings" />
      <div className="p-4 ">
        <BookingsComponent showStats={true} compact={true} />
      </div>
      
    </div>
  );
}

export default Bookings;
