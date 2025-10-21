import React from "react";

// Example blog data
const blogPosts = [
  {
    id: 1,
    title: "Top 10 Cleaning Tips for a Sparkling Home",
    excerpt:
      "Discover simple and effective cleaning tips that make your home shine and save time.",
    image: "https://picsum.photos/seed/cleaning1/800/400",
    link: "/blog/cleaning-tips",
  },
  {
    id: 2,
    title: "Why Deep Cleaning is Essential for Your Health",
    excerpt:
      "Learn why deep cleaning can reduce allergens, germs, and create a healthier living space.",
    image:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80",
    link: "/blog/deep-cleaning-health",
  },
  {
    id: 3,
    title: "Eco-Friendly Cleaning Products You Should Try",
    excerpt:
      "Switch to green cleaning products that are safe for your family and the environment.",
    image: "https://picsum.photos/seed/cleaning3/800/400",
    link: "/blog/eco-friendly-cleaning",
  },
];

export default function Blog() {
  return (
    <div className="container mx-auto p-8 pb-40">
      <h1 className="text-4xl font-bold mb-4 text-gray-800 text-center">
        Blog
      </h1>
      <p className="text-center text-gray-600 mb-12">
        Tips, news, and insights on keeping your home and office clean.
      </p>

      <div className="grid md:grid-cols-3 gap-8">
        {blogPosts.map((post) => (
          <a
            key={post.id}
            href={post.link}
            className="group block overflow-hidden rounded-lg shadow-lg bg-white transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                {post.title}
              </h3>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              <span className="text-green-600 font-semibold group-hover:underline">
                Read More →
              </span>
            </div>
          </a>
        ))}
      </div>

      {/* Divider before footer */}
      <div className="mt-20 border-t border-gray-300 w-3/4 mx-auto"></div>
    </div>
  );
}
