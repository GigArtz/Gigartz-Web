import { RootState } from "../../store/store";
import Header from "../components/Header";
import React, { useState, useRef, useEffect } from "react";
import { FaCamera, FaQrcode } from "react-icons/fa";
import QrScanner from "react-qr-scanner";
import { useSelector, useDispatch } from "react-redux";
import { scanTicket } from "../../store/eventsSlice"; // Import the action

function Scanner() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const scannerRef = useRef<any>(null); // To access video element
  const dispatch = useDispatch(); // Initialize dispatch

  const { uid } = useSelector((state: RootState) => state.auth);

  const handleScan = (data: any) => {
    if (data && data.text) {
      setScanResult(data.text);
      console.log("Scanned Data:", uid);
      dispatch(scanTicket(data?.text, uid)); // Dispatch the action
      stopScan(); // Stop scanning after successful scan
    }
  };

  const handleError = (error: any) => {
    console.error("QR Scan Error:", error);
  };

  const startScan = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  const stopScan = () => {
    setIsScanning(false);

    // Manually stop all video tracks to release the camera
    const videoEl = scannerRef.current?.video;
    const stream = videoEl?.srcObject as MediaStream;

    if (stream && stream.getTracks) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const toggleScan = () => {
    if (isScanning) {
      stopScan();
    } else {
      startScan();
    }
  };

  const previewStyle = {
    height: 240,
    width: 320,
  };

  // Optional: clean up on unmount
  useEffect(() => {
    return () => stopScan();
  }, []);

  return (
    <div className="main-content">
      <Header title="Scanner" />
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-2xl font-bold text-center mb-4">
          {isScanning ? "Scanning..." : "Scan a QR Code"}
        </h1>
        <p className="text-center mb-4 text-gray-600">
          Scan a QR code to get the data.
        </p>

        {isScanning && (
          <div className="flex flex-col items-center justify-center border rounded-lg p-2 shadow-md">
            <QrScanner
              delay={500}
              style={previewStyle}
              onError={handleError}
              onScan={handleScan}
              ref={scannerRef}
              constraints={{
                video: { facingMode: "environment" },
              }}
            />
          </div>
        )}

        {scanResult && (
          <p className="mt-4 text-green-600 font-medium text-center break-words w-full max-w-md">
            Scanned Data: {scanResult}
          </p>
        )}
      </div>

      <div className="fixed bottom-5 right-5 md:right-[5%] lg:right-[28%] z-10 md:z-40">
        <div className="relative items-center">
          <button
            onClick={toggleScan}
            className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg transform transition-all hover:scale-105 btn-primary ${
              isScanning ? "border-2 border-red-500" : ""
            }`}
            aria-label={isScanning ? "Stop scanning" : "Start scanning"}
          >
            {isScanning ? (
              <FaCamera className="w-6 h-6 text-white" />
            ) : (
              <FaQrcode className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Scanner;
