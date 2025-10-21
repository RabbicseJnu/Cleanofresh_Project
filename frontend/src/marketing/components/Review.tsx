import { useEffect, useState } from "react";

// ✅ avatars import from src (bundle-safe)
// ফাইলগুলো রাখো: src/marketing/assets/
import avatarFazle from "../assets/photo.jpg";
import avatarRoy   from "../assets/pavel.jpg";
// ফাইলের নামে স্পেস থাকলেও import করা যায়; চাইলে Reyal-Vai.jpg নামেও rename করতে পারো
import avatarReyal from "../assets/Reyal Vai.jpg";

type Item = {
  quote: string;
  name: string;
  url?: string;
  location: string;
  avatar: string;
};

const items: Item[] = [
  {
    quote: "They are very professional and do a great job cleaning the house!",
    name: "Fazle Rabbi",
    url: "#!",
    location: "Uttara, Dhaka.",
    avatar: avatarFazle,
  },
  {
    quote:
      "Regular cleaning service for my home. Always reliable and thorough. Highly recommend!",
    name: "Mr. Roy",
    url: "#!",
    location: "Kajipara, Dhaka.",
    avatar: avatarRoy,
  },
  {
    quote:
      "Their pest control service solved our ant problem completely. Very professional and knowledgeable.",
    name: "Nafiur Reyal",
    url: "#!",
    location: "Mirpur DOHS, Dhaka.",
    avatar: avatarReyal,
  },
];

export default function Testimonial() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 3000);
    return () => clearInterval(t);
  }, []);

  const it = items[idx];

  return (
    <section className="testi">
      <div className="container">
        <h2 className="testi-title">Happy Customers, Happy Homes</h2>
        <div className="testi-divider" />

        <div className="quote-wrap">
          <p className="testi-quote">{it.quote}</p>
        </div>

        <div className="testi-person">
          <img
            className="testi-avatar"
            src={it.avatar}
            alt={it.name}
            loading="lazy"
            onError={(e) => {
              // fallback image if file missing
              (e.currentTarget as HTMLImageElement).src =
                "https://via.placeholder.com/96x96?text=%F0%9F%91%A4";
            }}
          />
          <div className="testi-nameRow">
            {it.url ? (
              <a className="testi-name" href={it.url}>
                {it.name}
              </a>
            ) : (
              <span className="testi-name">{it.name}</span>
            )}
            <span className="testi-loc">, {it.location}</span>
          </div>
        </div>

        {items.length > 1 && (
          <div className="testi-dots">
            {items.map((_, i) => (
              <button
                key={i}
                className={"dot" + (i === idx ? " active" : "")}
                aria-label={`Go to testimonial ${i + 1}`}
                onClick={() => setIdx(i)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
