import React, { useState, useEffect, useCallback, useMemo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { CartContext } from "../contexts/CartContext";

const formatText = (str) =>
  String(str || "")
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const Services = ({ role }) => {
  const navigate = useNavigate();

  // ✅ cart context (unified cart)
  const { addToCart } = useContext(CartContext);

  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [selectedSubtype, setSelectedSubtype] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const fetchServices = useCallback(async () => {
    try {
      const response = await api.get("/services/");
      setServices(response.data || []);
      setFilteredServices(response.data || []);
      const uniqueTypes = [...new Set((response.data || []).map((s) => s.service_type))];
      setTypes(uniqueTypes);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const subtypes = useMemo(() => {
    if (!selectedType) return [];
    return [
      ...new Set(
        services
          .filter((s) => s.service_type === selectedType)
          .map((s) => s.service_subtype)
      ),
    ];
  }, [services, selectedType]);

  useEffect(() => {
    setLoading(true);
    setProgress(0);

    const progressTimer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 4));
    }, 20);

    const filterTimer = setTimeout(() => {
      let filtered = [...services];
      if (selectedType) filtered = filtered.filter((s) => s.service_type === selectedType);
      if (selectedSubtype)
        filtered = filtered.filter((s) => s.service_subtype === selectedSubtype);
      if (searchTerm)
        filtered = filtered.filter((s) =>
          (s.name || "").toLowerCase().includes(searchTerm.toLowerCase())
        );

      setFilteredServices(filtered);
      setLoading(false);
      setProgress(100);
      clearInterval(progressTimer);
    }, 300);

    return () => {
      clearTimeout(filterTimer);
      clearInterval(progressTimer);
    };
  }, [services, selectedType, selectedSubtype, searchTerm]);

  const circleStyle = {
    strokeDasharray: 283,
    strokeDashoffset: 283 - (283 * progress) / 100,
    transition: "stroke-dashoffset 0.2s linear",
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4">
        {role === "Admin" && (
          <div className="flex justify-end mb-6">
            <button
              type="button"
              className="px-5 py-2 rounded-lg shadow text-white transition hover:bg-green-700"
              style={{ backgroundColor: "#4A7C59" }}
              onClick={() => navigate("/admin/adminservicesbookings")}
            >
              Manage Services
            </button>
          </div>
        )}

        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Our Premium Services
        </h1>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center items-center">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-md p-2 w-full sm:w-64"
          />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border rounded-md p-2 w-full sm:w-48 bg-white"
          >
            <option value="">All Types</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {formatText(t)}
              </option>
            ))}
          </select>
          <select
            value={selectedSubtype}
            onChange={(e) => setSelectedSubtype(e.target.value)}
            className="border rounded-md p-2 w-full sm:w-48 bg-white"
            disabled={!selectedType || subtypes.length === 0}
          >
            <option value="">All Subtypes</option>
            {subtypes.map((st) => (
              <option key={st} value={st}>
                {formatText(st)}
              </option>
            ))}
          </select>
        </div>

        {/* Loading Radial */}
        {loading && (
          <div className="flex justify-center items-center my-12">
            <svg className="w-20 h-20" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" stroke="#d1d5db" strokeWidth="10" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#22c55e"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                style={circleStyle}
              />
            </svg>
          </div>
        )}

        {!loading && filteredServices.length === 0 && (
          <p className="text-center text-gray-700 mt-12 text-xl">
            No services match your search/filter.
          </p>
        )}

        {/* Service Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredServices.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-lg overflow-hidden shadow hover:shadow-xl transform hover:scale-105 transition cursor-pointer flex flex-col"
              onClick={() => navigate(`/service/${s.id}`)}
            >
              {s.image && (
                <img
                  src={String(s.image).startsWith("http") ? s.image : `http://127.0.0.1:8000${s.image}`}
                  alt={s.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4 flex flex-col flex-grow">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">{s.name}</h2>
                <p className="text-gray-600 text-sm mb-1 line-clamp-2">{s.description}</p>
                <p className="text-sm text-gray-700 mb-2">
                  Type: {formatText(s.service_type)}
                  {s.service_subtype && ` / ${formatText(s.service_subtype)}`}
                </p>
                {/* 🔁 BDT for consistency with rest of app */}
                <p className="text-lg font-bold text-green-600 mb-2">BDT {s.price}</p>

                <button
                  className="mt-auto bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-semibold transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    // ✅ add to unified cart as a "service"
                    addToCart(s, 1, "service");
                    // optional UX feedback
                    // toast or alert—kept simple to match your product page
                    alert(`${s.name} added to cart!`);
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
