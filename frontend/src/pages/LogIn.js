import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api"; // axios instance

function LoginPage({ setUser }) {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/auth/login/", formData);

      if (response.data) {
        const user = response.data.user;
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", response.data.token);

        setUser(user);

        // redirect based on role
        if (user.role === "Admin") navigate("/admin");
        else if (user.role === "Customer") navigate("/services");
        else if (user.role === "Vendor") navigate("/vendor-dashboard");
        else navigate("/");
      }
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      {/* Back to Home */}
      <div className="absolute top-6 left-6">
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg shadow hover:bg-gray-900 transition"
        >
          ← Back to Home
        </button>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Login
        </h2>

        {error && (
          <p className="text-red-500 mb-4 text-center font-medium">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            required
          />

          <button
            type="submit"
            className="w-full bg-[#6F8873] text-white p-3 rounded-lg shadow-md transition duration-300 transform hover:scale-105 hover:bg-[#5C6F5E]"
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => navigate("/register")}
            className="w-full bg-green-600 text-white p-3 rounded-lg shadow-md transition duration-300 hover:bg-green-700"
          >
            Create a new account
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
