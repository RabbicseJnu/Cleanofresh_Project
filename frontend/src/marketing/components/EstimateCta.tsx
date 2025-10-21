import { Link } from "react-router-dom";

// ✅ import background + photos from src/marketing/assets
import bgDefault from "../assets/CTA_bg.jpg";
import ETA1 from "../assets/ETA1.jpg";
import ETA2 from "../assets/ETA2.jpg";
import ETA3 from "../assets/ETA3.jpg";
import ETA4 from "../assets/ETA4.jpg";

type Props = {
  /** Optional override background image */
  bg?: string;
};

export default function EstimateCTA({ bg }: Props) {
  const bgUrl = bg ?? bgDefault;

  return (
    <section
      className="estimate-sec"
      style={{
        backgroundImage: `linear-gradient(rgba(205, 226, 248, 0.96), rgba(216, 250, 223, 0.96)), url(${bgUrl})`,
      }}
    >
      <div className="container estimate-row">
        {/* LEFT */}
        <div className="estimate-card">
          <h2 className="estimate-title">
            We Offer <span>Free In-Home</span> Estimates, So Why Wait?
          </h2>

          <h4>Ready for a cleaner facility</h4>
          <p>
            When it comes to gauging a complete and effective cleaning and
            sanitation solution, from a cost perspective, it is important to
            ensure the accuracy of all costs involved.
          </p>
          <p>
            This cost calculator is provided to clients to assist you in
            establishing the estimated cleaning cost for your company.
          </p>

          <Link to="/estimate" className="btn btn-primary estimate-cta">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="i"
              aria-hidden="true"
            >
              <path
                d="M4 6h16M4 10h16M4 14h10M4 18h6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Calculate Now
          </Link>
        </div>

        {/* RIGHT: 2×2 photo grid */}
        <div className="estimate-right">
          <div className="photo-grid">
            <div className="ph">
              <img src={ETA1} alt="Smiling family at home" loading="lazy" />
            </div>
            <div className="ph">
              <img src={ETA2} alt="Mother and daughter cleaning" loading="lazy" />
            </div>
            <div className="ph">
              <img src={ETA3} alt="Happy parents with kids" loading="lazy" />
            </div>
            <div className="ph">
              <img src={ETA4} alt="Family laying on the carpet" loading="lazy" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
