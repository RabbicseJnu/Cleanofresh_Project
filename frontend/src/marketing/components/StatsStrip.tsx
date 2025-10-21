import { useEffect, useRef, useState, type ReactElement } from "react";

type Stat = {
  label: string;
  target: number;
  suffix?: string;
  duration?: number;
  icon: ReactElement;
};

/* ---- Count-up hook (top-level & reusable) ---- */
function useCountUp(trigger: number, target: number, duration = 1600) {
  const [val, setVal] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    setVal(0);
    if (raf.current) cancelAnimationFrame(raf.current);

    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min((t - t0) / duration, 1);
      setVal(Math.round(target * p));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [trigger, target, duration]);

  return val;
}

/* ---- Child item component (hook lives at top of a component – OK) ---- */
function StatItem({ stat, trigger }: { stat: Stat; trigger: number }) {
  const value = useCountUp(trigger, stat.target, stat.duration ?? 1600);

  return (
    <div className="stat">
      <div className="stat-icon">{stat.icon}</div>
      <span className="green-line" />
      <div className="stat-num">
        {value.toLocaleString()}
        {stat.suffix ?? ""}
      </div>
      <div className="stat-label">{stat.label}</div>
    </div>
  );
}

export default function StatsStrip() {
  const secRef = useRef<HTMLElement | null>(null);

  // triggers the count-up when section becomes visible
  const [trigger, setTrigger] = useState(0);
  const wasVisible = useRef(false);

  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting && entry.intersectionRatio > 0.25;
        if (visible && !wasVisible.current) setTrigger((k) => k + 1);
        wasVisible.current = visible;
      },
      { threshold: [0, 0.25, 0.5, 1] }
    );

    if (secRef.current) io.observe(secRef.current);
    return () => io.disconnect();
  }, []);

  const stats: Stat[] = [
    {
      label: "Happy Customers",
      target: 1500,
      suffix: "+",
      icon: (
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 12a5 5 0 100-10 5 5 0 000 10zM3 22a9 9 0 0118 0"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M7 18l1.2 1.2 2.3-2.4M16.5 18l1 1 1.8-2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      label: "Service Guarantee",
      target: 100,
      suffix: "%",
      icon: (
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.9 7.2 18l.9-5.4L4.2 8.7l5.4-.8L12 3z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle cx="8" cy="10" r="1.2" fill="currentColor" />
          <path d="M10 14l6-6" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="16" cy="8" r="1.2" fill="currentColor" />
        </svg>
      ),
    },
    {
      label: "Cleaners",
      target: 30,
      suffix: "+",
      icon: (
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
          <path
            d="M7 7a3 3 0 116 0 3 3 0 01-6 0zM3 21a6 6 0 1112 0M17 8.5a2.5 2.5 0 115 0 2.5 2.5 0 01-5 0zM19.5 21v-1a5 5 0 00-3.5-4.8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      label: "Cleans Completed",
      target: 1000,
      icon: (
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 18h12M6 18l1.5-9h9L18 18M9 5h6M10 8V5m4 3V5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <section className="stats-strip" ref={secRef}>
      <div className="stats-overlay" />
      <div className="container stats-grid">
        {stats.map((s) => (
          <StatItem key={s.label} stat={s} trigger={trigger} />
        ))}
      </div>
    </section>
  );
}
