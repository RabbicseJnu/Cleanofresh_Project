// import React from "react";
// import { motion } from "framer-motion";

// function HomePage() {
//   return (
//     <div
//       className="flex flex-col items-center justify-center min-h-screen px-8 overflow-hidden"
//       style={{ backgroundColor: "#99C99C" }} // pastel green background
//     >
//       <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-2xl relative z-10">
//         <motion.h1
//           className="text-5xl font-bold text-gray-800 mb-4"
//           initial={{ opacity: 0, y: -30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//         >
//           Welcome to CleanoFresh
//         </motion.h1>

//         <motion.p
//           className="text-lg text-gray-600 mb-8"
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8, delay: 0.2 }}
//         >
//           Explore services and products, book appointments, and more.
//         </motion.p>

//         {/* Small spinning logo-like animation */}
//         <motion.div
//           className="w-16 h-16 mx-auto"
//           animate={{ rotate: 360 }}
//           transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
//         >
//           <svg
//             viewBox="0 0 100 100"
//             xmlns="http://www.w3.org/2000/svg"
//             className="w-full h-full"
//           >
//             {/* Nucleus */}
//             <circle cx="50" cy="50" r="6" fill="#22c55e" />

//             {/* Orbits */}
//             <ellipse
//               cx="50"
//               cy="50"
//               rx="30"
//               ry="12"
//               fill="none"
//               stroke="#16a34a"
//               strokeWidth="2"
//               transform="rotate(0 50 50)"
//             />
//             <ellipse
//               cx="50"
//               cy="50"
//               rx="30"
//               ry="12"
//               fill="none"
//               stroke="#16a34a"
//               strokeWidth="2"
//               transform="rotate(45 50 50)"
//             />
//             <ellipse
//               cx="50"
//               cy="50"
//               rx="30"
//               ry="12"
//               fill="none"
//               stroke="#16a34a"
//               strokeWidth="2"
//               transform="rotate(90 50 50)"
//             />
//             <ellipse
//               cx="50"
//               cy="50"
//               rx="30"
//               ry="12"
//               fill="none"
//               stroke="#16a34a"
//               strokeWidth="2"
//               transform="rotate(135 50 50)"
//             />
//           </svg>
//         </motion.div>
//       </div>

//       {/* Background floating bubbles */}
//       <motion.div
//         className="absolute w-32 h-32 bg-green-300 rounded-full opacity-30 blur-xl"
//         initial={{ x: -200, y: 200 }}
//         animate={{ x: 200, y: -200 }}
//         transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
//       />
//       <motion.div
//         className="absolute w-24 h-24 bg-green-400 rounded-full opacity-30 blur-lg"
//         initial={{ x: 300, y: -100 }}
//         animate={{ x: -200, y: 300 }}
//         transition={{ duration: 12, repeat: Infinity, repeatType: "reverse" }}
//       />
//       <motion.div
//         className="absolute w-40 h-40 bg-green-200 rounded-full opacity-30 blur-2xl"
//         initial={{ x: 0, y: 300 }}
//         animate={{ x: 0, y: -300 }}
//         transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
//       />
//     </div>
//   );
// }

// export default HomePage;
