import React from "react";
import { motion } from "framer-motion";

const testimonials = [
  {
    id: 1,
    name: "Ayesha Rahman",
    role: "Homeowner",
    text: "CleanOfresh transformed my apartment! The team was on time, professional, and left everything spotless.",
    image: "https://i.pravatar.cc/150?img=47",
  },
  {
    id: 2,
    name: "Md. Karim",
    role: "Business Owner",
    text: "We hired them for office deep cleaning. The staff was very efficient and detail-oriented. Highly recommended!",
    image: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: 3,
    name: "Sarah Islam",
    role: "Regular Customer",
    text: "I love their eco-friendly cleaning products. The team is polite, trustworthy, and consistent.",
    image: "https://i.pravatar.cc/150?img=32",
  },
];

export default function Testimonials() {
  return (
    <div className="container mx-auto p-12 pb-40 bg-gray-50">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
        What Our Customers Say
      </h2>

      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((t, index) => (
          <motion.div
            key={t.id}
            className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            viewport={{ once: true }}
          >
            <img
              src={t.image}
              alt={t.name}
              className="w-20 h-20 rounded-full object-cover mb-4 shadow-md"
            />
            <p className="text-gray-600 italic mb-4">“{t.text}”</p>
            <h4 className="text-lg font-semibold text-gray-800">{t.name}</h4>
            <span className="text-sm text-gray-500">{t.role}</span>
          </motion.div>
        ))}
      </div>

      {/* Divider before footer */}
      <div className="mt-20 w-3/4 mx-auto h-1 rounded-full bg-gradient-to-r from-white-400 via-white-500 to-white-600"></div>
    </div>
  );
}
