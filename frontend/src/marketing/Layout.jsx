import React from "react";
import Header from "./components/Header";   // তোমার কপিকৃত Header.jsx
import Footer from "./components/Footer";   // তোমার কপিকৃত Footer.jsx
import "./styles/site.css";                 // Cleanofresh এর styles.css

export default function SiteLayout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
