import Header from "../components/Header";
import React, { useState, useEffect } from "react";
import QrScanner from "react-qr-scanner";

function Scanner() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  useEffect(() => {
    const originalWarn = console.warn;
    console.warn = (message, ...args) => {
      if (!message.includes("defaultProps")) {
        originalWarn(message, ...args);
      }
    };
    return () => {
      console.warn = originalWarn; // Restore original console.warn
    };
  }, []);

  const handleScan = (data: any) => {
    if (data && data.text) {
      setScanResult(data.text); // Extract the `text` property
      setIsScanning(false); // Stop scanning after a successful scan
    }
  };

  const handleError = (error: any) => {
    console.error("QR Scan Error:", error);
  };

  const startScan = () => {
    setScanResult(null); // Clear previous scan result
    setIsScanning(true);
  };

  const stopScan = () => {
    setIsScanning(false); // Unmount the QrScanner component
  };

  const previewStyle = {
    height: 240,
    width: 320,
  };

  return (
    <div className="main-content">
      <Header title="Scanner" />
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-xl font-semibold">Scan QR Code</p>
        <div className="mt-4">
          {isScanning && (
            <QrScanner
              delay={500} // Increase delay to throttle frame processing
              style={previewStyle}
              onError={handleError}
              onScan={handleScan}
            />
          )}
        </div>
        <div className="mt-4 flex space-x-4">
          <button
            onClick={startScan}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Start Scan
          </button>
          <button
            onClick={stopScan}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Stop Scan
          </button>
        </div>
        {scanResult && (
          <p className="mt-4 text-green-600 font-medium">
            Scanned Data: {scanResult}
          </p>
        )}
      </div>
    </div>
  );
}

export default Scanner;
