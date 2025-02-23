import { useState, useEffect } from "react";
import { REACT_APP_FLINK } from "./config";

const ModifyMenu = () => {
  const [categories, setCategories] = useState([]);
  const [categoryLimits, setCategoryLimits] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newLimit, setNewLimit] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error"); 

  useEffect(() => {
    fetchCategoryLimits();
  }, []);

  const fetchCategoryLimits = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${REACT_APP_FLINK}get-category-limits`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      setCategoryLimits(data);
      setCategories(data.map(item => item.category));
    } catch (error) {
      showMessage("Error fetching category limits. Please try again.", "error");
      console.error("Error fetching categories:", error);
    }
  };

  const showMessage = (msg, type = "error") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  const handleLimitChange = (category, value) => {
    setCategoryLimits(prevLimits => 
      prevLimits.map(limit => 
        limit.category === category 
          ? { ...limit, limit: value } 
          : limit
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const limitsArray = categoryLimits.map(({ category, limit }) => ({
        category,
        limit: Number(limit)
      })).filter(item => !isNaN(item.limit) && item.limit >= 0);

      if (limitsArray.length === 0) {
        showMessage("No valid limits to update.", "error");
        return;
      }

      const response = await fetch(`${REACT_APP_FLINK}set-category-limit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ limits: limitsArray }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update category limits");
      }

      showMessage("Category limits updated successfully!", "success");
      fetchCategoryLimits(); 
    } catch (error) {
      showMessage(error.message || "Error updating limits. Please try again.", "error");
      console.error("Error updating limits:", error);
    }     

  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      showMessage("Category name cannot be empty.", "error");
      return;
    }
    if (categories.includes(newCategory)) {
      showMessage("Category already exists.", "error");
      return;
    }
    if (isNaN(Number(newLimit)) || Number(newLimit) < 0) {
      showMessage("Please enter a valid limit amount.", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const requestBody = {
        limits: [{
          category: newCategory.trim(),
          limit: Number(newLimit)
        }]
      };

      console.log("Sending request body:", requestBody); 

      const response = await fetch(`${REACT_APP_FLINK}set-category-limit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add category");
      }

      showMessage("Category added successfully!", "success");
      setNewCategory("");
      setNewLimit("");
      fetchCategoryLimits(); 
    } catch (error) {
      showMessage(error.message || "Error adding category. Please try again.", "error");
      console.error("Error adding category:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold text-center mb-4">Modify Category Limits</h2>
      
      {message && (
        <p className={`text-center font-medium mb-4 ${
          messageType === "error" ? "text-red-600" : "text-green-600"
        }`}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {categoryLimits.map(({ category, limit }) => (
          <div key={category} className="flex items-center justify-between border p-2 rounded">
            <label className="font-medium text-gray-700">{category}</label>
            <input
              type="number"
              min="0"
              value={limit || ""}
              onChange={(e) => handleLimitChange(category, e.target.value)}
              className="border p-1 rounded w-24"
            />
          </div>
        ))}

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New Category"
              className="border p-2 rounded flex-1"
            />
            <input
              type="number"
              min="0"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              placeholder="Limit"
              className="border p-2 rounded w-24"
            />
          </div>
          <button
            type="button"
            onClick={handleAddCategory}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Category
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          Save All Limits
        </button>
      </form>
    </div>
  );
};

export default ModifyMenu;