// frontend/src/App.js
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import "./App.css";
import "./index.css";

// ===== Your existing app pages/components =====
import Navbar from "./components/MainNavBar";
import Services from "./pages/Services";
import ServiceInfo from "./pages/ServicesInfo";

import LoginPage from "./pages/LogIn";
import RegisterPage from "./pages/RegisterPage";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import CartPage from "./pages/CartPage";
import BookingPage from "./pages/BookingPage";

// Admin
import AdminSidebar from "./components/Admin/AdminSidebar";
import AdminTopNav from "./components/Admin/AdminTopNav";
import AdminCRM from "./pages/Admin/AdminCRM";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminServicesBookings from "./pages/Admin/AdminServicesBookings";
import AdminEcommerce from "./pages/Admin/AdminEcommerce";
import AdminPeopleOrganizations from "./pages/Admin/AdminPeopleOrganizations";

// Vendor / Customer
import VendorDashboard from "./pages/Vendor/VendorDashboard";
import CustomerDashboard from "./pages/Customer/CustomerDashboard";

// Auth guard + profile
import ProtectedRoute from "./components/ProtectedRoutes";
import Profile from "./pages/Profile";

// Cart Context
import { CartProvider } from "./contexts/CartContext";

// ===== Cleanofresh (marketing site) =====
import MarketingApp from "./marketing";      
import SiteLayout from "./marketing/Layout"; 

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* ===================== Redirects ===================== */}
          <Route path="/shop" element={<Navigate to="/products" replace />} />

          {/* ===================== Services ===================== */}
          <Route
            path="/services"
            element={
              <SiteLayout>
                <Services role={user?.role} />
              </SiteLayout>
            }
          />
          <Route
            path="/service/:id"
            element={
              <SiteLayout>
                <ServiceInfo />
              </SiteLayout>
            }
          />
          <Route path="/booking" element={<BookingPage />} />

          {/* ===================== ✅ Profile ===================== */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute user={user}>
                <SiteLayout>
                  <Profile />
                </SiteLayout>
              </ProtectedRoute>
            }
          />

          {/* ===================== Auth ===================== */}
          <Route path="/login" element={<LoginPage setUser={setUser} />} />
          <Route path="/register" element={<RegisterPage setUser={setUser} />} />

          {/* ===================== Products ===================== */}
          <Route
            path="/products"
            element={
              <SiteLayout>
                <Products />
              </SiteLayout>
            }
          />
          <Route
            path="/products/:id"
            element={
              <SiteLayout>
                <ProductDetails />
              </SiteLayout>
            }
          />
          <Route
            path="/cart"
            element={
              <SiteLayout>
                <CartPage />
              </SiteLayout>
            }
          />

          {/* ===================== Vendor ===================== */}
          <Route
            path="/vendor-dashboard"
            element={
              <ProtectedRoute user={user} role="Vendor">
                <SiteLayout>
                  <VendorDashboard />
                </SiteLayout>
              </ProtectedRoute>
            }
          />

          {/* ===================== Customer ===================== */}
          <Route
            path="/customerdashboard"
            element={
              <ProtectedRoute user={user} role="Customer">
                <SiteLayout>
                  <CustomerDashboard />
                </SiteLayout>
              </ProtectedRoute>
            }
          />

          {/* ===================== Admin ===================== */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute user={user} role="Admin">
                <div>
                  <aside
                    className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-lg overflow-y-auto z-40"
                    style={{ WebkitOverflowScrolling: "touch" }}
                  >
                    <AdminSidebar />
                  </aside>

                  <div className="ml-64 min-h-screen flex flex-col">
                    <AdminTopNav setUser={setUser} />
                    <main className="flex-1 overflow-auto p-4">
                      <Routes>
                        <Route path="/" element={<Navigate to="admindashboard" replace />} />
                        <Route path="admindashboard" element={<AdminDashboard />} />
                        <Route path="admincrm" element={<AdminCRM />} />
                        <Route path="adminservicesbookings" element={<AdminServicesBookings />} />
                        <Route path="adminecommerce" element={<AdminEcommerce />} />
                        <Route path="adminpeopleorganizations" element={<AdminPeopleOrganizations />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* ===================== Marketing site (last, acts as fallback for /, /about, etc.) ===================== */}
          <Route path="/*" element={<MarketingApp />} />

          {/* Final fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
