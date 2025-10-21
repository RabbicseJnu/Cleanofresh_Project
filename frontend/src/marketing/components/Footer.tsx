import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/** Services map to /services#id */
const services = [
  { label: "Apartment Cleaning", id: "apartment-cleaning" },
  { label: "House Cleaning", id: "house-cleaning" },
  { label: "Move In / Move Out", id: "move-in-move-out" },
  { label: "Carpet Cleaning", id: "carpet-cleaning" },
  { label: "After Renovation", id: "after-renovation" },
  { label: "Curtain Cleaning", id: "curtain-cleaning" },
  { label: "Window Cleaning", id: "window-cleaning" },
  { label: "Commercial Cleaning", id: "commercial-cleaning" },
  { label: "Residential Cleaning", id: "residential-cleaning" },
];

export default function Footer() {
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        {/* Left: hanging ribbon + text + newsletter */}
        <div className="foot-left">
          {/* 🔰 Hanging glossy ribbon (screenshot style) */}
          <div className="ribbon-container">
            <div className="ribbon">
              {/* curled top edges */}
              <span className="curl l" aria-hidden />
              <span className="curl r" aria-hidden />

              <div className="stars-row">
                <span className="star">★</span>
                <span className="star">★</span>
                <span className="star">★</span>
                <span className="star">★</span>
              </div>

              <span className="text-large">THE BEST</span>
              <span className="text-small">Cleaning Service</span>

              <div className="stars-row">
                <span className="star">★</span>
                <span className="star">★</span>
              </div>
            </div>
          </div>

          <p className="foot-copy">
            We use natural and eco-friendly cleaning products and have a customer
            satisfaction guarantee.
          </p>

          <div className="newsletter">
            <h4 className="foot-title">Newsletter</h4>
            <form
              className="nl-form"
              onSubmit={(e) => {
                e.preventDefault();
                alert("Thanks! We’ll keep you posted.");
              }}
            >
              <input type="email" required placeholder="Email address" />
              <button aria-label="Subscribe">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M4 6h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Middle: services */}
        <div className="foot-mid">
          <h4 className="foot-title">Cleaning Services</h4>
          <ul className="tick-list">
            {services.map((s) => (
              <li key={s.id}>
                <span className="tick" />
                <Link
                  to={`/services#${s.id}`}
                  className="service-link"
                  onClick={() => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })}
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: contact info */}
        <div className="foot-right">
          <h4 className="foot-title">Contact Information</h4>
          <ul className="contact-list">
            <li>
              <i className="ico">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="12" cy="10" r="2.7" fill="currentColor" />
                </svg>
              </i>
              H#1332, Avenue#2, Mirpur DOHS, Dhaka-1216
            </li>
            <li>
              <i className="ico">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 3h3l2 5-2 1a13 13 0 005 5l1-2 5 2v3a2 2 0 01-2 2A16 16 0 013 7a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </i>
              <a className="contact-link" href="tel:+8801987030000">+88 01987-030000</a>
            </li>
            <li>
              <i className="ico">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M4 6h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </i>
              <a className="contact-link" href="mailto:info@cleanofresh.com">info@cleanofresh.com</a>
            </li>
            <li>
              <i className="ico">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </i>
              Sat-Thu: 8AM-7PM
            </li>
          </ul>
          <Link to="/estimate" className="btn-primary">Get A Free Estimate</Link>
        </div>
      </div>

      {/* bottom bar */}
      <div className="footer-bar">
        <div className="container bar-row">
          <div className="bar-left">
            © {new Date().getFullYear()} CleanoFresh. All rights reserved.
          </div>

          {/* animated underline */}
          <a href="#privacy" className="link-underline" data-tip="Read our policy">
            Privacy Policy
          </a>

          {/* interactive socials */}
          <div className="social">
            <a href="#" aria-label="Facebook" className="sbtn tip" data-brand="fb" data-tip="Facebook">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 22v-8h3l1-4h-4V7a1 1 0 011-1h3V2h-3a5 5 0 00-5 5v3H6v4h3v8h4z" />
              </svg>
            </a>

            <a href="#" aria-label="Twitter" className="sbtn tip" data-brand="tw" data-tip="Twitter / X">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 5.8a8.3 8.3 0 01-2.4.7 4.1 4.1 0 001.8-2.3 8.2 8.2 0 01-2.6 1A4.1 4.1 0 0012 8.7a11.7 11.7 0 01-8.5-4.3 4 4 0 001.3 5.4 4 4 0 01-1.9-.5v.1a4.1 4.1 0 003.3 4 4 4 0 01-1.8.1 4.1 4 0 003.8 2.8A8.3 8.3 0 012 19.6a11.7 11.7 0 006.3 1.9c7.6 0 11.8-6.3 11.8-11.8v-.5A8.3 8.3 0 0022 5.8z" />
              </svg>
            </a>

            <button
              type="button"
              aria-label="Share"
              className="sbtn tip" data-brand="sh" data-tip="Share"
              onClick={() => {
                // @ts-ignore
                if (navigator.share) {
                  // @ts-ignore
                  navigator.share({ title: 'CleanoFresh', url: window.location.href });
                } else {
                  navigator.clipboard?.writeText(window.location.href);
                  alert('Link copied!');
                }
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8a3 3 0 100-6 3 3 0 000 6zM6 14a3 3 0 100-6 3 3 0 000 6zm12 8a3 3 0 100-6 3 3 0 000 6z" />
                <path d="M8.6 9.7l6.8-3.4M8.6 14.3l6.8 3.4" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* back to top */}
      {showTop && (
        <button
          className="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 5l7 8M12 5L5 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </footer>
  );
}
