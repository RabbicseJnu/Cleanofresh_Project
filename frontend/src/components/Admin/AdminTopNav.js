import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../../api"; // your axios instance


import {
  LayoutDashboard,
  CircleUserRound,
  ChevronDown,
  Home as HomeIcon,
} from "lucide-react";
import "./AdminTopNav.css";

function AdminTopNav({ setUser }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user")); // only username

  const pageTitles = {
    "/admin/admindashboard": "Dashboard",
    "/admin/admincrm": "CRM",
    "/admin/adminservicesbookings": "Services & Bookings",
    "/admin/adminecommerce": "E-Commerce",
    "/admin/adminpeopleorganizations": "People & Organizations",
    "/admin/adminevents": "Events",
    "/admin/adminaffiliatesmarketing": "Affiliates & Marketing",
    "/admin/admincommunications": "Communications",
    "/admin/adminreports": "Analytics & Reports",
    "/admin/admincontentmedia": "Content & Media",
    "/admin/adminsettings": "System & Security",
    "/admin/adminabout": "About",
    "/admin/admincontact": "Contact",
  };

  const title = pageTitles[location.pathname] || "Page";



const handleLogout = async () => {
  try {
    await api.post("/auth/logout/"); // invalidates token server-side if implemented
  } catch (err) {
    console.warn("Logout request failed:", err);
  }
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  navigate("/login");
  window.location.reload();
};

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="topnav flex justify-between items-center px-6 py-3 relative bg-white shadow-md">
      <div className="logo font-bold text-xl">{title}</div>

      {user && (
        <div className="relative" ref={dropdownRef}>
          {/* Username button */}
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-1 text-gray-700 font-semibold hover:text-blue-600"
          >
            <span>{user.username}</span>
            <ChevronDown size={16} className="ml-1" />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
              <Link
                to="/admin"
                className="flex items-center px-4 py-2 hover:bg-gray-100 text-gray-700"
                onClick={() => setDropdownOpen(false)}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
              <Link
                to="/"
                className="flex items-center px-4 py-2 hover:bg-gray-100 text-gray-700"
                onClick={() => setDropdownOpen(false)}
              >
                <HomeIcon className="mr-2 h-4 w-4" />
                Home
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
      )}
    </header>
  );
}

export default AdminTopNav;
