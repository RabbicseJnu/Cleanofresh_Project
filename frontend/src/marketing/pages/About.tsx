import React from "react";
import { Link } from "react-router-dom";

// ✅ Import all images from src so bundler resolves them
import aboutImg     from "../assets/About Our Company.jpg";
import teamFazle    from "../assets/photo.jpg";
import teamRoy      from "../assets/pavel.jpg";
// if you renamed the file to remove space, e.g. "Reyal-Vai.jpg", change the import accordingly
import teamReyal    from "../assets/Reyal Vai.jpg";
import valuesImg    from "../assets/Our Values.jpg";
import hist1        from "../assets/H_CC.jpg";
import hist2        from "../assets/H_CC1.jpg";
import sgxPhoto     from "../assets/H_FA_C.jpg";
import sgxStamp     from "../assets/S_logo3.png";

export default function About() {
  return (
    <div className="container page">
      {/* --- About Our Company --- */}
      <section className="aboutx-hero">
        <h2 className="aboutx-title">About Our Company</h2>
        <div className="aboutx-divider">
          <span className="aboutx-dot" />
        </div>
        <p className="aboutx-subtitle">
          Cleaning can be a chore and we know you have many choices when you
          consider hiring a comprehensive, high quality, reliable cleaning service.
        </p>
      </section>

      {/* full-bleed left image + right panel */}
      <section className="aboutx-content aboutx-bleed">
        <div className="aboutx-imageWrap">
          <img src={aboutImg} alt="Our team collaborating" />
        </div>
        <div className="aboutx-text">
          <div className="aboutx-inner">
            <h3>More than 10 years of cleaning experience</h3>
            <p>
              Cleaning Company service is a fully integrated janitorial cleaning services
              company that provides comprehensive, high quality, reliable cleaning solutions
              to commercial, corporate, industrial and residential clients.
            </p>
            <p>
              Our diligent management and work ethic are central to Cleaning Company service
              business philosophy and critical to delivering consistent, quality cleaning services.
              We pride ourselves on making our management accountable to the client through direct
              access and interaction with our managing director.
            </p>
          </div>
        </div>
      </section>

      {/* ===== Mission & Vision ===== */}
      <section className="mvx">
        <article className="mvx-card mvx--mission">
          <div className="mvx-tag">
            Mission <span className="mvx-flag" aria-hidden="true" />
          </div>
          <div className="mvx-body">
            <div className="mvx-icon">
              {/* target icon — uses currentColor */}
              <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true">
                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
                <path d="M16.5 7.5l5-5M21.5 2.5v4h-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <p>
              Deliver reliable, high-quality cleaning and facility services with a
              consistent, client-first approach that improves hygiene, safety, and comfort.
            </p>
          </div>
        </article>

        <article className="mvx-card mvx--vision">
          <div className="mvx-tag">
            Vision <span className="mvx-flag" aria-hidden="true" />
          </div>
          <div className="mvx-body">
            <div className="mvx-icon">
              {/* bulb icon — uses currentColor */}
              <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true">
                <path d="M9 18h6M10 21h4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M12 3a7 7 0 0 1 4.2 12.6c-.6.45-1.2 1.35-1.2 2.4H9c0-1.05-.6-1.95-1.2-2.4A7 7 0 0 1 12 3Z"
                  fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p>
              Be the most trusted cleaning partner through innovation, trained teams,
              and sustainable practices that set the standard for cleanliness and care.
            </p>
          </div>
        </article>
      </section>

      {/* ===== Our Team (UPDATED) ===== */}
      <section className="tvx">
        <div className="tvx-hero">
          <h2>Our Team</h2>
          <div className="tvx-divider"><span /></div>
          <p>
            Cleaning Company is a minority owned business with a large group of specially trained,
            dedicated employees to provide professional service with a personal touch.
          </p>
        </div>

        <div className="tvx-grid">
          {/* Member 1 */}
          <article className="tvx-card">
            <div className="tvx-photo">
              <img src={teamFazle} alt="Fazle Rabbi" />

              {/* slide-up social overlay */}
              <div className="tvx-overlay">
                <a href="#" aria-label="Facebook" className="tvx-soc">
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path fill="currentColor"
                      d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07c0 5.01 3.66 9.16 8.44 9.93v-7.02H7.9v-2.91h2.54V9.41c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22c4.78-.77 8.44-4.92 8.44-9.93Z" />
                  </svg>
                </a>
                <a href="#" aria-label="Twitter/X" className="tvx-soc">
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path fill="currentColor"
                      d="M3 3h3.3l5.1 7.1L14.8 3H21l-7.7 9.9L21 21h-3.3l-5.6-7.7L9.2 21H3l7.7-9.1L3 3Z" />
                  </svg>
                </a>
                <a href="#" aria-label="Instagram" className="tvx-soc">
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path fill="currentColor"
                      d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8.2A3.2 3.2 0 1 1 12 8.8a3.2 3.2 0 0 1 0 6.4Zm6.4-8.62a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0ZM4.5 2h15A2.5 2.5 0 0 1 22 4.5v15A2.5 2.5 0 0 1 19.5 22h-15A2.5 2.5 0 0 1 2 19.5v-15A2.5 2.5 0 0 1 4.5 2Zm0 2a.5.5 0 0 0-.5.5v15c0 .28.22.5.5.5h15c.28 0 .5-.22.5-.5v-15a.5.5 0 0 0-.5-.5h-15Z" />
                  </svg>
                </a>
              </div>
            </div>

            <h4>Fazle Rabbi</h4>
            <div className="tvx-role">Managing Director</div>
            <div className="tvx-underline" />
            <p>
              Fazle started in 1985 and provides the leadership needed to maintain our reputation
              and goodwill in the community.
            </p>
          </article>

          {/* Member 2 */}
          <article className="tvx-card">
            <div className="tvx-photo">
              <img src={teamRoy} alt="Mr. Roy" />
              <div className="tvx-overlay">
                <a href="https://www.facebook.com/share/1MN5MXZJHB/" aria-label="Facebook" className="tvx-soc">
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path fill="currentColor"
                      d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07c0 5.01 3.66 9.16 8.44 9.93v-7.02H7.9v-2.91h2.54V9.41c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22c4.78-.77 8.44-4.92 8.44-9.93Z" />
                  </svg>
                </a>
                <a href="#" aria-label="Twitter/X" className="tvx-soc">
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path fill="currentColor"
                      d="M3 3h3.3l5.1 7.1L14.8 3H21l-7.7 9.9L21 21h-3.3l-5.6-7.7L9.2 21H3l7.7-9.1L3 3Z" />
                  </svg>
                </a>
                <a href="#" aria-label="Instagram" className="tvx-soc">
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path fill="currentColor"
                      d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8.2A3.2 3.2 0 1 1 12 8.8a3.2 3.2 0 0 1 0 6.4Zm6.4-8.62a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0ZM4.5 2h15A2.5 2.5 0 0 1 22 4.5v15A2.5 2.5 0 0 1 19.5 22h-15A2.5 2.5 0 0 1 2 19.5v-15A2.5 2.5 0 0 1 4.5 2Zm0 2a.5.5 0 0 0-.5.5v15c0 .28.22.5.5.5h15c.28 0 .5-.22.5-.5v-15a.5.5 0 0 0-.5-.5h-15Z" />
                  </svg>
                </a>
              </div>
            </div>

            <h4>Mr. Roy</h4>
            <div className="tvx-role">Customer Service Manager</div>
            <div className="tvx-underline" />
            <p>
              He is the direct “pipeline” to our customers to ensure they’re being heard and their
              special needs are being met.
            </p>
          </article>

          {/* Member 3 */}
          <article className="tvx-card">
            <div className="tvx-photo">
              <img src={teamReyal} alt="Nafiur Reyal" />
              <div className="tvx-overlay">
                <a href="#" aria-label="Facebook" className="tvx-soc">
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path fill="currentColor"
                      d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07c0 5.01 3.66 9.16 8.44 9.93v-7.02H7.9v-2.91h2.54V9.41c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22c4.78-.77 8.44-4.92 8.44-9.93Z" />
                  </svg>
                </a>
                <a href="#" aria-label="Twitter/X" className="tvx-soc">
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path fill="currentColor"
                      d="M3 3h3.3l5.1 7.1L14.8 3H21l-7.7 9.9L21 21h-3.3l-5.6-7.7L9.2 21H3l7.7-9.1L3 3Z" />
                  </svg>
                </a>
                <a href="#" aria-label="Instagram" className="tvx-soc">
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path fill="currentColor"
                      d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8.2A3.2 3.2 0 1 1 12 8.8a3.2 3.2 0 0 1 0 6.4Zm6.4-8.62a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0ZM4.5 2h15A2.5 2.5 0 0 1 22 4.5v15A2.5 2.5 0 0 1 19.5 22h-15A2.5 2.5 0 0 1 2 19.5v-15A2.5 2.5 0 0 1 4.5 2Zm0 2a.5.5 0 0 0-.5.5v15c0 .28.22.5.5.5h15c.28 0 .5-.22.5-.5v-15a.5.5 0 0 0-.5-.5h-15Z" />
                  </svg>
                </a>
              </div>
            </div>

            <h4>Nafiur Reyal</h4>
            <div className="tvx-role">Office Administrator</div>
            <div className="tvx-underline" />
            <p>
              Reyal joined our team in 2009. She brings a wealth of knowledge and experience
              in the accounting field.
            </p>
          </article>
        </div>
      </section>

      {/* ===== Our Values (NEW) ===== */}
      <section className="vxx">
        <div className="vxx-hero">
          <h2>Our Values</h2>
          <div className="vxx-divider"><span /></div>
          <p>
            Our goal is Your satisfaction (of course after our cleaning work).
            Office Phone works around the clock (24/7).
          </p>
        </div>

        <div className="vxx-grid">
          {/* left image */}
          <div className="vxx-imgWrap">
            <img src={valuesImg} alt="Cleaning company team at work" />
          </div>

          {/* right list */}
          <div className="vxx-list">
            {/* item 1 */}
            <article className="vxx-item">
              <div className="vxx-icon" aria-hidden="true">
                {/* LEAF ICON */}
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path d="M5 14.5c5.8-1.7 9.6-5.8 12-10 2.3 4.5 2.6 10-2.2 13-3.3 2.1-7.6 2-9.8-1.7Z" fill="currentColor" />
                  <path d="M7 13l6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h4>Client oriented</h4>
                <p>
                  We serve our clients as if we were serving ourselves. We value their
                  feedback and we use it to improve our work.
                </p>
              </div>
            </article>

            {/* item 2 */}
            <article className="vxx-item">
              <div className="vxx-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path d="M5 14.5c5.8-1.7 9.6-5.8 12-10 2.3 4.5 2.6 10-2.2 13-3.3 2.1-7.6 2-9.8-1.7Z" fill="currentColor" />
                  <path d="M7 13l6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h4>Eco-Friendly Oriented</h4>
                <p>
                  We carefully choose the best and most natural cleaning products that
                  give amazing results.
                </p>
              </div>
            </article>

            {/* item 3 */}
            <article className="vxx-item">
              <div className="vxx-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path d="M5 14.5c5.8-1.7 9.6-5.8 12-10 2.3 4.5 2.6 10-2.2 13-3.3 2.1-7.6 2-9.8-1.7Z" fill="currentColor" />
                  <path d="M7 13l6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h4>Expansion / Growth</h4>
                <p>
                  We make ourselves known in the community; we create long-term relations,
                  while constantly expanding—bringing in more people to work for us.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ===== History (NEW) ===== */}
      <section className="hx pattern-full">
        <div className="pattern-content">
          <div className="hx-grid">
            {/* LEFT: two stacked images */}
            <div className="hx-images">
              <figure className="hx-image">
                <img src={hist1} alt="Company history 1" />
              </figure>
              <figure className="hx-image">
                <img src={hist2} alt="Company history 2" />
              </figure>
            </div>

            {/* Right content */}
            <div className="hx-content">
              <h2 className="hx-title">History of Cleaning Company</h2>
              <div className="hx-divider"><span /></div>

              <h3 className="hx-subhead">
                Providing house and offices cleaning services for more than 10 years
              </h3>

              <p className="hx-intro">
                The Cleaning Company is widely recognized for our commitment to serving our
                customers while staying friendly to the environment. We have a history of
                excellence and dedication to our clients, providing professional and high-quality
                house cleaning services across America.
              </p>

              {/* Highlight banner */}
              <div className="hx-banner">
                <span className="hx-flag" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M6 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M6 5h10l-2 2 2 2H6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <strong>
                  Franchising began in 1996 and has grown to include more than 215 locations across North America.
                </strong>
              </div>

              {/* 3 columns text */}
              <div className="hx-cols">
                <p>
                  The Cleaning Company is widely recognized for our commitment to serving our customers while
                  staying friendly to the environment. We have a history of excellence and dedication to our
                  clients, providing professional and quality house cleaning services across America.
                </p>
                <p>
                  This quality commitment and reputation for excellent service attracted outside investors. In 2014,
                  the company announced a majority acquisition by PNC Riverarch Capital. This exciting change didn’t
                  mean a complete overhaul:
                </p>
                <p>
                  The management team did not change and Steve continued on in his leadership position with the Board
                  of Directors. We are excited to announce a new era of growth for both new and existing units under
                  the guidance of PNC.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Satisfaction Guaranteed (NEW) ===== */}
      <section className="sgx">
        <div className="sgx-grid">
          {/* Left: copy */}
          <div className="sgx-copy">
            <h2 className="sgx-title">Satisfaction Guaranteed!</h2>

            <p className="sgx-p">
              The experts at The Cleaning Company are committed to providing thorough
              house cleaning services for our customers nationwide.
            </p>
            <p className="sgx-p">
              If you are not happy with any area we’ve cleaned, simply call within 24 hours and
              we will come back out and reclean it free of charge. This makes hiring Cleaning
              Company virtually risk free. Our maids are thoroughly screened through our
              rigorous recruitment process, and every one of them goes through our Maid
              University training process.
            </p>

            <Link to="/estimate" className="sgx-btn">Get A Free Estimate</Link>
          </div>

          {/* Right: image + stamp */}
          <div className="sgx-media">
            <img className="sgx-photo" src={sgxPhoto} alt="Happy family after cleaning" />
            <img className="sgx-stamp" src={sgxStamp} alt="" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* ===== Why Hire Us (NEW) ===== */}
      <section className="whx">
        <div className="whx-hero">
          <h2>Why Hire Us?</h2>
          <div className="whx-divider"><span /></div>
          <p>
            Choose us because of our reputation for excellence. For more than 10 years,
            we’ve earned a name for quality and customer service.
          </p>
        </div>

        <div className="whx-grid">
          {/* 1 */}
          <article className="whx-card">
            <div className="whx-badge">
              {/* shield-check */}
              <svg className="whx-ico" viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
                <path d="M12 3l7 3v5c0 5.25-3.5 8.75-7 10-3.5-1.25-7-4.75-7-10V6l7-3Z"
                  fill="none" stroke="currentColor" strokeWidth="1.8" />
                <path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h4>With Us, Your Satisfaction Is Guaranteed</h4>
            <p>
              The experts at The Cleaning Company are committed to providing thorough
              house cleaning services for our valued customers nationwide.
            </p>
          </article>

          {/* 2 */}
          <article className="whx-card">
            <div className="whx-badge">
              {/* lock/shield */}
              <svg className="whx-ico" viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
                <path d="M12 3l7 3v5c0 5.25-3.5 8.75-7 10-3.5-1.25-7-4.75-7-10V6l7-3Z"
                  fill="none" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="12" cy="12" r="2.3" fill="none" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </div>
            <h4>Our Bonded &amp; Insured Cleaning Team</h4>
            <p>
              Our company is fully bonded and insured, which means you can have peace of
              mind when you hire us as your residential cleaning company.
            </p>
          </article>

          {/* 3 */}
          <article className="whx-card">
            <div className="whx-badge">
              {/* team */}
              <svg className="whx-ico" viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
                <circle cx="12" cy="8" r="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="6.5" cy="9.5" r="1.7" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="17.5" cy="9.5" r="1.7" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <path d="M4.5 16c.8-2 2.8-3.2 5-3.2h5c2.2 0 4.2 1.2 5 3.2"
                  fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <h4>Our Teams Consist of Fully Trained Employees</h4>
            <p>
              Every individual goes through a thorough screening process, then is trained
              in every aspect of our home cleaning services.
            </p>
          </article>

          {/* 4 */}
          <article className="whx-card">
            <div className="whx-badge">
              {/* home/map pin */}
              <svg className="whx-ico" viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
                <path d="M3 11l9-7 9 7" fill="none" stroke="currentColor" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 10v9h14v-9" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="12" cy="14" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </div>
            <h4>Locally Owned Home Cleaning Services</h4>
            <p>
              Enjoy peace of mind knowing your home is in good hands, while you focus on
              the things that matter most to you.
            </p>
          </article>

          {/* 5 */}
          <article className="whx-card">
            <div className="whx-badge">
              {/* phone/quote */}
              <svg className="whx-ico" viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
                <path d="M6 2h12a2 2 0 0 1 2 2v12l-4-3H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"
                  fill="none" stroke="currentColor" strokeWidth="1.8" />
                <path d="M8 7h8M8 10h6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <h4>Free Over the Phone Estimates</h4>
            <p>
              We keep your home beautiful while giving you more time for yourself and
              the things you love most.
            </p>
          </article>

          {/* 6 */}
          <article className="whx-card">
            <div className="whx-badge">
              {/* award */}
              <svg className="whx-ico" viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
                <circle cx="12" cy="9" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <path d="M10 14l-2 6 4-2 4 2-2-6" fill="none" stroke="currentColor" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h4>We Guarantee Our Work</h4>
            <p>
              We strive to provide the highest level of quality, service and value to each
              customer. If you are not satisfied, please inform us.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
