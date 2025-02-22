import { useState } from "react";
import { useUserSign } from "./codeContext";
import { flink } from "./backend/config";

const Auth = () => {
  const [isSignin, setIsSignin] = useState(true);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const { setUsersignedIn } = useUserSign();  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isSignin ? `${flink}/signin` : `${flink}signup`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Request failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", userId);

      setUsersignedIn(true); 

      alert(`${isSignin ? "Sign-in" : "Sign-up"} successful!`);
    } catch (error) {
      console.error("Error:", error.message);
      alert(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
          {isSignin ? "Sign In" : "Sign Up"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">User ID</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 outline-none"
              placeholder="Enter your user ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 outline-none"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-all"
          >
            {isSignin ? "Sign In" : "Sign Up"}
          </button>
        </form>
        <button
          onClick={() => setIsSignin(!isSignin)}
          className="mt-4 text-blue-600 hover:underline w-full text-center"
        >
          {isSignin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
        </button>
      </div>
    </div>
  );
};

export default Auth;
