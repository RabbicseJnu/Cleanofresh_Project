// src/marketing/components/HomeServices.tsx
import { useEffect, useState } from "react";


type Item = { title: string; points: string[]; icon: "window" | "home" | "building" };

/* === 7 cards === */
const ITEMS: Item[] = [
  { title: "Window Cleaning", points: ["Carpet Cleaning", "Dust all furniture", "Hard surface floor cleaning"], icon: "window" },
  { title: "Residential Cleaning", points: ["Hard Surface Cleaning", "Upholstery Cleaning", "Carpet Cleaning"], icon: "home" },
  { title: "Commercial Cleaning", points: ["Carpet Cleaning", "Tile and grout cleaning", "Hard surface floor cleaning"], icon: "building" },
  { title: "Deep Cleaning", points: ["Kitchen & Bath detail", "Inside cabinets (on request)", "Baseboards & vents"], icon: "home" },
  { title: "Move In/Out Cleaning", points: ["Appliances in/out", "Inside closets", "Final touch surfaces"], icon: "building" },
  { title: "Carpet Cleaning", points: ["Stain treatment", "Deodorize & sanitize", "Fast dry time"], icon: "home" },
  { title: "Office Disinfection", points: ["High-touch surfaces", "Meeting rooms", "After-hours slots"], icon: "building" },
];

export default function HomeServices() {
  // desktop: 3-card view, mobile: 1-card view
  const [visible, setVisible] = useState(3);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const apply = () => setVisible(window.innerWidth >= 992 ? 3 : 1);
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  const maxIndex = Math.max(0, ITEMS.length - visible);

  const goPrev = () =>
    setIdx((i) => {
      const next = i - visible;
      return next < 0 ? maxIndex : next;
    });

  const goNext = () =>
    setIdx((i) => {
      const next = i + visible;
      return next > maxIndex ? 0 : next;
    });

  // Auto slide every 10s
  useEffect(() => {
    const t = setInterval(() => {
      setIdx((i) => {
        const next = i + visible;
        return next > maxIndex ? 0 : next;
      });
    }, 10000);
    return () => clearInterval(t);
  }, [visible, maxIndex]);

  return (
    <section id="services" className="section services-sec">
      <div className="container">
        <h2 className="sec-title">Our Cleaning Services</h2>
        <div className="sec-divider"><span/></div>
        <p className="sec-sub">
          Let us use our years of experience, skilled employees, and advanced procedures to ensure a clean and
          healthy environment for your employees, customers and guests.
        </p>

        {/* viewport */}
        <div className="services-viewport">
          <div
            className="services-track"
            style={{
              transform: `translateX(-${(100 / visible) * idx}%)`,
              ["--visible" as any]: String(visible),
            }}
          >
            {ITEMS.map((it, i) => (
              <article key={i} className="service-card">
                {/* ICON */}
                <div className="svc-icon">
                  {it.icon === "window" && (
                    <svg width="64" height="64" viewBox="0 0 48 48" fill="none">
                      <rect x="8" y="10" width="32" height="28" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M24 10v28M8 24h32" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  )}
                  {it.icon === "home" && (
                    <svg width="64" height="64" viewBox="0 0 48 48" fill="none">
                      <rect x="10" y="16" width="28" height="22" rx="2" stroke="currentColor" strokeWidth="2" />
                      <rect x="18" y="24" width="8" height="14" rx="1" stroke="currentColor" strokeWidth="2" />
                      <path d="M6 18l18-10 18 10" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  )}
                  {it.icon === "building" && (
                    <svg width="64" height="64" viewBox="0 0 48 48" fill="none">
                      <rect x="8" y="14" width="12" height="24" rx="1" stroke="currentColor" strokeWidth="2" />
                      <rect x="24" y="10" width="16" height="28" rx="1" stroke="currentColor" strokeWidth="2" />
                      <path d="M8 30h12M24 26h16" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  )}
                </div>

                <h3 className="svc-title">{it.title}</h3>

                <ul className="svc-list">
                  {it.points.map((p, k) => (
                    <li key={k}>
                      <span className="tick" /> {p}
                    </li>
                  ))}
                </ul>

                <button type="button" className="btn btn-outline-blue svc-btn">Read More</button>
              </article>
            ))}
          </div>
        </div>

        {/* nav pill */}
        <div className="services-nav">
          <div className="nav-pill">
            <button className="nav-left" onClick={goPrev} aria-label="Previous">‹</button>
            <button className="nav-right" onClick={goNext} aria-label="Next">›</button>
          </div>
        </div>
      </div>
    </section>
  );
}
