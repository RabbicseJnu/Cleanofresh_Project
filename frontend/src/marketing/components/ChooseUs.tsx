import React from "react";
import carpet from "../assets/Carpet Cleaning.jpg";       
import living from "../assets/Bright living room.jpg";     
import kitchen from "../assets/Modern kitchen.jpg";

function LeafIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M20.5 3.5C13 4 5 9 5 16.5c0 2.5 2 4 4.5 4 7.5 0 12.5-8 11-17Z" stroke="#22c55e" strokeWidth="2" fill="none" />
      <path d="M11 13c-2 1-3.5 2-5 5" stroke="#22c55e" strokeWidth="2" />
    </svg>
  );
}

export default function ChooseUs() {
  return (
    <section className="choose-sec">
      <div className="container choose-grid">
        {/* Left: image mosaic */}
        <div className="mosaic">
          <img className="tall" src={carpet} alt="Vacuuming carpet" loading="lazy" />
          <img className="small" src={living} alt="Bright living room" loading="lazy" />
          <img className="small" src={kitchen} alt="Modern kitchen" loading="lazy" />
        </div>

        {/* Right: copy */}
        <div className="choose-copy">
          <h2 className="choose-title">
            Reasons to <span className="accent">Choose Us</span>
          </h2>
          <p className="choose-lead">
            Behind our commitment to excellence are few key attributes that define who we are
            and what makes us different from any other.
          </p>

          <ul className="reasons">
            <li className="reason">
              <div className="icon"><LeafIcon /></div>
              <div>
                <h4>Top-Rated Company</h4>
                <p>We hold a successful track record of satisfying our customers and getting back their bond money.</p>
              </div>
            </li>

            <li className="reason">
              <div className="icon"><LeafIcon /></div>
              <div>
                <h4>Superior Quality</h4>
                <p>We use excellent quality tools & equipment to get all the dust and dirt out of your premises.</p>
              </div>
            </li>

            <li className="reason">
              <div className="icon"><LeafIcon /></div>
              <div>
                <h4>Eco-Friendly Products</h4>
                <p>We use biodegradable products that don’t harm the environment, pets or humans in any way.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
