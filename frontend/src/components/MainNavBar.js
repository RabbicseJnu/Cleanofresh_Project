import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, CircleUserRound, ChevronDown, ShoppingCart } from "lucide-react";
import api from "../api"; // Import the api instance
import { CartContext } from "../contexts/CartContext";

function MainNavBar() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { cart } = useContext(CartContext); // Get cart items

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout/"); // invalidates token server-side if implemented
    } catch (err) {
      console.warn("Logout request failed:", err);
    }
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  return (
    <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center relative">
      <div className="text-2xl font-bold text-blue-600">CleanoFresh</div>

      <div className="space-x-4 flex items-center">
        <Link to="/" className="text-gray-700 hover:text-blue-600">
          Home
        </Link>
        <Link to="/services" className="text-gray-700 hover:text-blue-600">
          Services
        </Link>
        <Link to="/products" className="text-gray-700 hover:text-blue-600">
          Products
        </Link>

        {/* Show cart only for customers */}
        {user?.role === "Customer" && (
          <Link to="/cart" className="relative text-gray-700 hover:text-blue-600 flex items-center">
            <ShoppingCart size={20} className="mr-1" />
            Cart
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </Link>
        )}

        {user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-1 text-gray-700 font-semibold hover:text-blue-600"
            >
              <span>{user.username}</span>
              <span className="text-xs text-gray-500">({user.role})</span>
              <ChevronDown size={16} className="ml-1" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                <Link
                  to={
                    user.role === "Admin"
                      ? "/admin"
                      : user.role === "Vendor"
                        ? "/vendor-dashboard"
                        : "/customerdashboard"
                  }
                  className="flex items-center px-4 py-2 hover:bg-gray-100 text-gray-700"
                  onClick={() => setDropdownOpen(false)}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-2 hover:bg-gray-100 text-gray-700"
                  onClick={() => setDropdownOpen(false)}
                >
                  <CircleUserRound className="mr-2 h-4 w-4" />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 font-semibold"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" className="text-blue-600 font-semibold">
              Login
            </Link>
            <Link to="/register" className="text-green-600 font-semibold">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default MainNavBar;
