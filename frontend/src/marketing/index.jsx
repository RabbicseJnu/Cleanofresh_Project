import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SiteLayout from "./Layout";

// Pages (marketing)
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Blog from "./pages/Blog";
import Contacts from "./pages/Contacts";
import FAQs from "./pages/FAQs";
import Estimate from "./pages/Estimate";
import Shop from "./pages/Shop";
import Testimonial from "./pages/Testimonial";

// Cart page lives in src/pages (not marketing/pages)
import CartPage from "../pages/CartPage";

export default function MarketingApp() {
  return (
    <SiteLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/estimate" element={<Estimate />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/testimonial" element={<Testimonial />} />

        {/* Cart route */}
        <Route path="/cart" element={<CartPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SiteLayout>
  );
}
