import React, { useState, useEffect, useRef } from "react";
import { useScanning, useError, useCodeData } from "../components/codeContext";
import jsQR from "jsqr";
import { REACT_APP_FLINK } from "./config";

const QRScanner = () => {
  const { scanning, setScanning } = useScanning();
  const { scanResult, setScanResult } = useCodeData();
  const { error, setError } = useError();

  const [formStep, setFormStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [userCategories, setUserCategories] = useState([]);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState("");

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

  useEffect(() => {
    fetchUserCategories();
  }, []);

  const fetchUserCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${REACT_APP_FLINK}get-category-limits`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) return handleLogout();

      const data = await response.json();
      setUserCategories(data.map(item => item.category));
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to load categories");
    }
  };

  const createNewCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const token = localStorage.getItem("token");
      await fetch(`${REACT_APP_FLINK}set-category-limit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          limits: [{ category: newCategory, limit: 1000 }], // Default limit
        }),
      });

      setUserCategories([...userCategories, newCategory]);
      setSelectedCategory(newCategory);
      setShowNewCategoryInput(false);
      setNewCategory("");
      setFormStep(2);
    } catch (error) {
      console.error("Error creating category:", error);
      setError("Failed to create category");
    }
  };

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
      stream.current.getTracks().forEach(track => track.stop());
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
      setLoading(true);
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
      setFormStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategory) {
      setError("Please select a category");
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated. Please log in again.");
  
      const baseUPI = scanResult;
      const redirectUrl = baseUPI.includes('?') 
        ? `${baseUPI}&am=${amount}`
        : `${baseUPI}?am=${amount}`;
  
      console.log("Sending transaction with URL:", redirectUrl); 
  
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
          payee: baseUPI 
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 411) {
          setError(`⚠️ Limit exceeded! You have ₹${errorData.message.match(/\d+/)} left.`);
        } else {
          setError(errorData.message || "Transaction failed");
        }
        return;
      }
      
  
      const data = await response.json();
      window.location.href = redirectUrl; 
    } catch (error) {
      console.error("Transaction error details:", error);
      setError(error.message || "Failed to process transaction");
    }
  };
  return (
    <div className="bg-gray-100 p-4">
      {loading ? (
        <div className="text-center text-gray-600">Loading...</div>
      ) : (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          {formStep === 0 && (
            <div className="p-4">
              <h1 className="text-2xl font-bold text-center mb-4">Scan a UPI QR</h1>
              {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
              <div className="flex justify-center mb-4">
                <button 
                  onClick={() => setScanning(true)} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Scan
                </button>
              </div>
              <video ref={videoRef} className="w-full"></video>
              <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
          )}

          {formStep === 1 && (
            <div className="p-6">
              <h1 className="text-2xl font-bold text-center mb-4">Select Category</h1>
              <div className="space-y-4">
                {userCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setFormStep(2);
                    }}
                    className={`w-full p-2 rounded-lg border ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
                
                {showNewCategoryInput ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Enter new category name"
                      className="w-full p-2 border rounded-lg"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={createNewCategory}
                        className="flex-1 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Create
                      </button>
                      <button
                        onClick={() => setShowNewCategoryInput(false)}
                        className="flex-1 p-2 border rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowNewCategoryInput(true)}
                    className="w-full p-2 border rounded-lg hover:bg-gray-50"
                  >
                    + Add New Category
                  </button>
                )}
              </div>
            </div>
          )}

          {formStep === 2 && (
            <div className="p-6">
              <h1 className="text-2xl font-bold text-center mb-4">Enter Amount</h1>
              <p className="mb-4 text-center text-gray-600">
                Selected Category: <span className="font-medium">{selectedCategory}</span>
                <button 
                  onClick={() => setFormStep(1)} 
                  className="ml-2 text-blue-600 underline"
                >
                  Change
                </button>
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
      )}
     {error && (
  <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center font-medium">
    ⚠️ {error}
  </div>
)}


    </div>
  );
};

export default QRScanner;