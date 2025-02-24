import React, { useEffect, useState } from "react";
import { REACT_APP_FLINK } from "./config";

const Analytics = () => {
  const [categoryLimits, setCategoryLimits] = useState([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated. Please log in again.");

      // Fetch category limits
      const categoryResponse = await fetch(`${REACT_APP_FLINK}get-category-limits`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (categoryResponse.status === 401) return handleLogout();
      const categoryData = await categoryResponse.json();
      setCategoryLimits(categoryData);

      const totalResponse = await fetch(`${REACT_APP_FLINK}get-analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (totalResponse.status === 401) return handleLogout();
      const totalData = await totalResponse.json();
      setMonthlyTotal(totalData.total || 0);
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError("Failed to load analytics data");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Session expired. Please log in again.");
    window.location.href = "/login";
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold text-center mb-4">Analytics</h2>
      {error && <div className="text-red-600 text-center mb-4">{error}</div>}

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Category Limits</h3>
        <ul className="space-y-2">
          {categoryLimits.length > 0 ? (
            categoryLimits.map((item) => (
              <li key={item.category} className="flex justify-between border-b pb-1">
                <span>{item.category}</span>
                <span className="font-semibold">₹{item.limit}</span>
              </li>
            ))
          ) : (
            <p className="text-gray-500">No category limits found.</p>
          )}
        </ul>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mt-4">
        <h3 className="text-lg font-semibold mb-2">Total Spent This Month</h3>
        <p className="text-2xl font-bold text-center">₹{monthlyTotal}</p>
      </div>
    </div>
  );
};

export default Analytics;
