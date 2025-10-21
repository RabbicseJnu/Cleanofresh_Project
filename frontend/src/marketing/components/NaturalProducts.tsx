import React from "react";
import n1 from "../assets/N1.png";

export default function NaturalProducts() {
  return (
    <section className="products-sec" aria-labelledby="natural-products-title">
      <div className="container products-row">
        {/* visual */}
        <div className="products-visual">
    
          <img
            src={n1}
            alt="Natural cleaning products"
            loading="lazy"
          />
        </div>
        

        {/* copy */}
        <div className="products-copy">
          <h2 id="natural-products-title" className="products-title">
            <span>Natural</span> Cleaning Products
          </h2>

          <p className="products-intro">
            We feel good about cleaning with our self-formulated, natural products
            that are better for the environment.
          </p>

          <ul className="products-benefits">
            <li className="benefit">
              <span className="leaf" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20.5 3.5C14.5 4 8.6 7.5 4.9 12.6c-1.7 2.4-2.4 4.3-2.4 4.3s2 0.7 4.5-1.1C12.9 12 16.5 6.1 17 3.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 14.5c-1.2-.5-2.6-.5-4 0"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <div>
                <h4>100% Safe &amp; Organic</h4>
                <p>
                  We combine high concentrates of pure organic essential oils with
                  quality plant-derived ingredients.
                </p>
              </div>
            </li>

            <li className="benefit">
              <span className="leaf" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20.5 3.5C14.5 4 8.6 7.5 4.9 12.6c-1.7 2.4-2.4 4.3-2.4 4.3s2 0.7 4.5-1.1C12.9 12 16.5 6.1 17 3.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 14.5c-1.2-.5-2.6-.5-4 0"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <div>
                <h4>We Care About The Earth</h4>
                <p>
                  All of our packaging, bottles, cleaning equipment, even our
                  uniforms come from recycled, fairtrade or low-impact origins.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
