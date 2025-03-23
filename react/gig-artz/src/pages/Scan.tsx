import Header from "../components/Header";
import React from "react";

function Scanner() {
  return (
    <div className="main-content">
      <Header title="Scanner" />
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-xl font-semibold">Scan QR Code</p>
      </div>
    </div>
  );
}

export default Scanner;
