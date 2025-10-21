import React from "react";


const officeAddress = "Cleanofresh Ltd, H-72, R-06, Mirpur-12, Dhaka-1216";

export default function Contacts() {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    officeAddress
  )}&output=embed&z=15`; // z = zoom

  return (
    <div className="container page">
      <h1 className="page-title">Contact Us</h1>

      {/* Full-width map (edge-to-edge). Remove class 'full-bleed' if you want to keep it inside container width. */}
      <section className="contact-map full-bleed">
        <iframe
          title="Office location map"
          src={mapSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </section>
    </div>
  );
}
