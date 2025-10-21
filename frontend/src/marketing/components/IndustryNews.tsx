import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";

/* ✅ Import images from src so bundler resolves them */
import cin5 from "../assets/CIN5.jpg";
import cin1 from "../assets/CIN1.jpg";
import cin2 from "../assets/CIN2.jpg";
import sinkGerm from "../assets/sink_germ.jpg";
import cin3 from "../assets/CIN3.jpg";
import cin4 from "../assets/CIN4.jpg";

type Post = {
  img: string;
  date: string;
  title: string;
  excerpt: string;
  href?: string;
};

const posts: Post[] = [
  {
    img: cin5,
    date: "June 20, 2024",
    title: "Apartment Therapy Mom Wisdom on… Taking Care",
    excerpt:
      "I am still learning about my home. If you can’t do it yourself, find good service people and trea.",
    href: "#",
  },
  {
    img: cin1,
    date: "June 16, 2024",
    title: "The “Flip and Fluff” Routine is the Best Thing",
    excerpt:
      "Our spring cleaning journey has been about turning over some lesser-cleaned leaves and refreshing your space t.",
    href: "#",
  },
  {
    img: cin2,
    date: "June 15, 2024",
    title: "New Cleaning With Hydrogen Peroxide Tips",
    excerpt:
      "Hiring just the right housekeeper can be life-altering for the busy family. Now this may seem to be a little o.",
    href: "#",
  },
  {
    img: sinkGerm,
    date: "June 12, 2024",
    title: "Keep Your Kitchen Sink Germ-Free",
    excerpt:
      "Daily wipe downs and a weekly deep clean can keep your sink fresh and stainless.",
    href: "#",
  },
  {
    img: cin3,
    date: "June 10, 2024",
    title: "Eco-Friendly Cleaning Products We Love",
    excerpt:
      "Biodegradable and safer for pets & kids—our top picks to try this month.",
    href: "#",
  },
  {
    img: cin4,
    date: "June 08, 2024",
    title: "How to Speed Clean Before Guests Arrive",
    excerpt:
      "A 20-minute checklist that makes your home presentable in a snap.",
    href: "#",
  },
];

// helper
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export default function IndustryNews() {
  const [perView, setPerView] = useState(3);
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 700) setPerView(1);
      else if (w < 1100) setPerView(2);
      else setPerView(3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const pages = useMemo(() => chunk(posts, perView), [perView]);
  const pageCount = pages.length;

  useEffect(() => {
    if (page >= pageCount) setPage(0);
  }, [pageCount, page]);

  useEffect(() => {
    if (paused || pageCount <= 1) return;
    const t = setInterval(() => setPage((p) => (p + 1) % pageCount), 3000);
    return () => clearInterval(t);
  }, [paused, pageCount]);

  const prev = () => setPage((p) => (p - 1 + pageCount) % pageCount);
  const next = () => setPage((p) => (p + 1) % pageCount);

  return (
    <section
      className="news-sec"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="container">
        <h2 className="sec-title center">Cleaning Industry News</h2>
        <div className="sec-divider">
          <span />
        </div>
        <p className="sec-sub center">
          We write about industry developments, training, health and safety,
          eco-friendly cleaning products, recycling practices and advice for
          working with professional cleaners.
        </p>

        <div className="news-wrap" ref={wrapRef}>
          <button className="news-arrow left" onClick={prev} aria-label="previous">
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="news-viewport">
            <div
              className="news-track"
              style={{ transform: `translateX(-${page * 100}%)` }}
            >
              {pages.map((group, pi) => (
                <div
                  key={pi}
                  className="news-page"
                  style={{ ["--per" as any]: perView }}
                >
                  {group.map((p, i) => (
                    <article key={pi + "-" + i} className="news-card">
                      <div className="pic">
                        <img src={p.img} alt={p.title} loading="lazy" />
                        <a className="zoom-btn" href={p.href || "#"} aria-label="open">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M10 14l4-4m-6 8l-2 2a4 4 0 11-6-6l2-2m16 0l2-2a4 4 0 10-6-6l-2 2"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </a>
                      </div>
                      <div className="meta">{p.date}</div>
                      <h3 className="news-title">{p.title}</h3>
                      <p className="news-excerpt">{p.excerpt}</p>
                      <Link to={p.href || "#"} className="btn btn-outline-blue news-read">
                        Read More
                      </Link>
                    </article>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <button className="news-arrow right" onClick={next} aria-label="next">
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
