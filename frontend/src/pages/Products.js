import React, { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { CartContext } from "../contexts/CartContext";

const Products = () => {
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get("/products/");
      setProducts(res.data || []);
      setFilteredProducts(res.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter with debounce + fake radial progress (your pattern)
  useEffect(() => {
    setLoading(true);
    setProgress(0);

    const progressTimer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 4));
    }, 20);

    const timer = setTimeout(() => {
      const filtered = (products || []).filter((p) =>
        (p.name || "").toLowerCase().includes((searchTerm || "").toLowerCase())
      );
      setFilteredProducts(filtered);
      setLoading(false);
      setProgress(100);
      clearInterval(progressTimer);
    }, 300);

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, [searchTerm, products]);

  const circleStyle = {
    strokeDasharray: 283,
    strokeDashoffset: 283 - (283 * progress) / 100,
    transition: "stroke-dashoffset 0.2s linear",
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Our Products
        </h1>

        {/* Search */}
        <div className="flex justify-center mb-8">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-md p-2 w-full sm:w-64"
          />
        </div>

        {/* Loading */}
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

        {/* No products */}
        {!loading && filteredProducts.length === 0 && (
          <p className="text-center text-gray-700 mt-12 text-xl">
            No products found.
          </p>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-lg overflow-hidden shadow hover:shadow-xl transform hover:scale-105 transition cursor-pointer flex flex-col"
            >
              {p.image && (
                <img
                  src={String(p.image).startsWith("http") ? p.image : `http://127.0.0.1:8000${p.image}`}
                  alt={p.name}
                  className="w-full h-48 object-cover cursor-pointer"
                  onClick={() => navigate(`/products/${p.id}`)}
                />
              )}
              <div className="p-4 flex flex-col flex-grow">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">{p.name}</h2>
                <p className="text-gray-600 text-sm mb-1 line-clamp-2">{p.description}</p>
                <p className="text-lg font-bold text-green-600 mb-2">BDT {p.price}</p>

                <button
                  className="mt-auto bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded font-semibold transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    // ✅ add to unified cart explicitly as "product"
                    addToCart(p, 1, "product");
                    alert(`${p.name} added to cart!`);
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

export default Products;
