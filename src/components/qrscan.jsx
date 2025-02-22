import React, { useEffect, useState } from "react";
import { useScanning, useError, useCodeData } from "../components/codeContext";
import { Html5Qrcode } from "html5-qrcode";
import { flink } from "./backend/config";

const QRScanner = () => {
  const { scanning, setScanning } = useScanning();
  const { scanResult, setScanResult } = useCodeData();
  const { error, setError } = useError();

  const [formStep, setFormStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [amount, setAmount] = useState("");

  const categories = ["Food", "Shopping", "Entertainment", "Travel", "Bills", "Other"];

  useEffect(() => {
    let html5QrCode;

    if (scanning) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
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
        html5QrCode
          .start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            (decodedText) => {
              console.log("QR Code decoded:", decodedText);
              setScanning(false);
              setScanResult(decodedText);
              setFormStep(1);
              html5QrCode
                .stop()
                .then(() => console.log("Scanner stopped"))
                .catch((err) => console.error("Error stopping scanner:", err));
            },
            (errorMessage) => {
              console.log("Scanning error:", errorMessage);
            }
          )
          .catch((err) => console.error("Error starting scanner:", err));
      }
    }

    return () => {
      if (html5QrCode?.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [scanning, setError, setScanResult, setScanning]);

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      
      const baseUPI = scanResult; 
      
      const redirectUrl = `${baseUPI}&am=${amount}`;
      
      const response = await fetch(flink + "check-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: selectedCategory,
          amount: Number(amount),
          redirectUrl, 
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Transaction failed");
      
      window.location.href = data.redirect;
    } catch (error) {
      console.error("Transaction submission error:", error.message);
      alert(error.message);
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {formStep === 0 ? (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4">
            <h1 className="text-2xl font-bold text-center mb-4">QR Code Scanner</h1>
            {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
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
      ) : formStep === 1 ? (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-4">Select Category</h1>
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setFormStep(2);
                }}
                className={`px-4 py-2 rounded-full border transition-colors ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-4">Enter Transaction Amount</h1>
          <p className="mb-4 text-center text-gray-600">
            Selected Category: <span className="font-medium">{selectedCategory}</span>
          </p>
          <form onSubmit={handleTransactionSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Amount (INR):</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount in INR"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Submit Transaction
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
