import React, { useState, useEffect, useRef } from "react";
import { useScanning, useError, useCodeData } from "../components/codeContext";
import jsQR from "jsqr";
import { REACT_APP_FLINK } from "./config";

const QRScanner = ({ openModify }) => {
  const { scanning, setScanning } = useScanning();
  const { scanResult, setScanResult } = useCodeData();
  const { error, setError } = useError();

  const [formStep, setFormStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [loadingCategory, setLoadingCategory] = useState(false);
  const categories = ["Food", "Shopping", "Entertainment", "Transport", "Bills", "Other"];

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  let stream = useRef(null);

  useEffect(() => {
    if (scanning) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [scanning]);

  const startCamera = async () => {
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream.current;
        videoRef.current.play();
        requestAnimationFrame(scanQRCode);
      }
    } catch (err) {
      setError("Error accessing camera");
    }
  };

  const stopCamera = () => {
    if (stream.current) {
      stream.current.getTracks().forEach((track) => track.stop());
    }
  };

  const scanQRCode = () => {
    if (!scanning || !videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      setScanResult(code.data);
      fetchCategoryForPayee(code.data);
      setScanning(false);
    } else {
      requestAnimationFrame(scanQRCode);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Session expired. Please log in again.");
    window.location.href = "/login";
  };

  const fetchCategoryForPayee = async (payee) => {
    try {
      setLoadingCategory(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${REACT_APP_FLINK}get-category`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ payee }),
      });

      if (response.status === 401) return handleLogout();

      const data = await response.json();
      if (response.ok && data.category) {
        setSelectedCategory(data.category);
        setFormStep(2);
      } else {
        setFormStep(1);
      }
    } catch (error) {
      console.error("Error fetching category:", error);
    } finally {
      setLoadingCategory(false);
    }
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    try {
      let token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated. Please log in again.");

      const baseUPI = scanResult;
      const redirectUrl = `${baseUPI}&am=${amount}`;
      console.log("API URL:", REACT_APP_FLINK);

      console.log("Token being sent:", localStorage.getItem("token"));

      const response = await fetch(`${REACT_APP_FLINK}check-transaction`, {
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
      console.error("Transaction error:", error.message);
      alert(error.message);
    }
  };

  return (
    <div className="bg-gray-100 p-4">
      {loadingCategory ? (
        <div className="text-center text-gray-600">Fetching category...</div>
      ) : formStep === 0 ? (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden p-4">
          <h1 className="text-2xl font-bold text-center mb-4">Scan a UPI QR</h1>
          {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
          <div className="flex justify-center mb-4">
            <button onClick={() => setScanning(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Scan</button>
          </div>
          <video ref={videoRef} className="w-full"></video>
          <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
      ) : (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-4">Enter Amount</h1>
          <p className="mb-4 text-center text-gray-600">
            Selected Category: <span className="font-medium">{selectedCategory}</span>
            <button onClick={() => setFormStep(1)} className="ml-2 text-blue-600 underline">Change</button>
          </p>
          <form onSubmit={handleTransactionSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Amount (INR):</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount in INR" className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300" required />
            </div>
            <button type="submit" className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700 transition-colors">Submit Transaction</button>
          </form>
        </div>
      )}
      <div className="flex justify-center items-center h-40">
        <button className="bg-green-400 p-4 rounded-full" onClick={openModify}>Limits</button>
      </div>
    </div>
  );
};

export default QRScanner;
