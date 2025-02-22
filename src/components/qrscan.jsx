import React, { useEffect } from "react";
import { useScanning, useError, useCodeData } from "../components/codeContext";
import { Html5Qrcode } from "html5-qrcode";

const QRScanner = () => {
  const { scanning, setScanning } = useScanning();
  const { scanResult, setScanResult } = useCodeData();
  const { error, setError } = useError();

  useEffect(() => {
    let html5QrCode;

    if (scanning) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(() => {
          console.log("Camera permission granted");
          startScanner();
        })
        .catch((err) => {
          console.error("Camera permission denied", err);
          setError("Camera permission denied. Please allow access.");
        });

      function startScanner() {
        html5QrCode = new Html5Qrcode("reader");

        html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          (decodedText) => {
            setScanning(false);
            setScanResult(decodedText);
            html5QrCode.stop();
          },
          (errorMessage) => console.log("Scanning error:", errorMessage)
        );
      }
    }

    return () => {
      if (html5QrCode?.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [scanning]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-center mb-4">QR Code Scanner</h1>

          {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

          {scanResult && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
              <p className="font-semibold">Scanned Result:</p>
              <p className="break-all">{scanResult}</p>
            </div>
          )}

          <div className="flex justify-center mb-4">
            {!scanning ? (
              <button
                onClick={() => {
                  setScanResult("");
                  setError("");
                  setScanning(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Scanning
              </button>
            ) : (
              <button
                onClick={() => setScanning(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Stop Scanning
              </button>
            )}
          </div>

          {scanning && <div id="reader" className="w-full"></div>}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
