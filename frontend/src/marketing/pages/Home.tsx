import { Link } from "react-router-dom";
import { useEffect, useState, type ReactNode } from "react";


import HomeServices from "../components/HomeServices";
import AboutCompany from "../components/AboutCompany";
import ChooseUs from "../components/ChooseUs";
import Review from "../components/Review";
import IndustryNews from "../components/IndustryNews";
import StatsStrip from "../components/StatsStrip";
import EstimateCta from "../components/EstimateCta";
import NaturalProducts from "../components/NaturalProducts";

// ✅ real filenames (with spaces)
import slide1 from "../assets/cleanofresh image 1.jpg";
import slide2 from "../assets/cleanofresh image 2.jpg";
import slide3 from "../assets/Window Cleaning.jpg";

export default function Home() {
  return (
    <>
      <Hero />
      <HomeServices />
      <AboutCompany />
      <ChooseUs />
      <Review />
      <IndustryNews />
      <StatsStrip />
      <EstimateCta />
      <NaturalProducts />
    </>
  );
}

type Slide = {
  img: string;
  kicker: string;
  title: ReactNode;        // ✅ was: string | JSX.Element
  ctas?: { label: string; to: string }[];
};

function Hero() {
  const slides: Slide[] = [
    {
      img: slide1,
      kicker: "Professional Cleaning Services",
      title: (
        <>
          SO FRESH &amp; SO CLEAN...
          <br className="hide-mobile" /> WE PROMISE!
        </>
      ),
      ctas: [
        { label: "Free Estimate", to: "/estimate" },
        { label: "Our Services", to: "/services" },
      ],
    },
    {
      img: slide2,
      kicker: "Trusted Professionals",
      title: (
        <>
          Spotless Spaces

          <br className="hide-mobile" /> Happy Faces
        </>
      ),
      ctas: [{ label: "Book Now", to: "/services" }],
    },
    {
      img: slide3,
      kicker: "Eco-Friendly Products",
      title: (
        <>
          Clean That Cares
          <br className="hide-mobile" /> For Your Home & Office
        </>
      ),
      ctas: [
        { label: "Shop Supplies", to: "/products" },
        { label: "Contact Us", to: "/contacts" },
      ],
    },
  ];

  const [idx, setIdx] = useState(0);

  // auto-advance
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <section className="hero">
      {/* Slides (image + caption belong to each slide) */}
      <div className="slider">
        {slides.map((s, i) => (
          <div key={i} className={`slide ${i === idx ? "active" : ""}`}>
            <img className="bg" src={s.img} alt={`Hero slide ${i + 1}`} />
            <div className="overlay" />

            <div className="center">
              <div className="caption">
                <span className="cap-line kicker">{s.kicker}</span>
                <h1 className="cap-line">{s.title}</h1>

                {!!s.ctas?.length && (
                  <div className="cap-line hero-cta-row">
                    {s.ctas.map((c, k) => (
                      <Link key={k} to={c.to} className="btn btn-outline-white">
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* dots */}
      <div className="dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === idx ? "active" : ""}`}
            onClick={() => setIdx(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
