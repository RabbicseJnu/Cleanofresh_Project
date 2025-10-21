import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { CartContext } from "../contexts/CartContext";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}/`);
        setProduct(res.data);
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    alert(`${product.name} added to cart!`);
  };

  if (loading)
    return (
      <p className="text-center mt-24 text-gray-700 text-lg">Loading...</p>
    );
  if (!product)
    return (
      <p className="text-center mt-24 text-gray-700 text-lg">
        Product not found.
      </p>
    );

  return (
    <div className="min-h-screen bg-green-100 py-12">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl p-8 md:flex md:items-center md:gap-12">
        {/* Product Image */}
        <div className="flex-shrink-0 md:w-1/2">
          <img
            src={
              product.image.startsWith("http")
                ? product.image
                : `http://127.0.0.1:8000${product.image}`
            }
            alt={product.name}
            className="w-full h-auto rounded-2xl object-contain shadow-lg"
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 mt-6 md:mt-0">
          <button
            className="text-blue-600 font-medium mb-4 hover:underline"
            onClick={() => navigate("/products")}
          >
            &larr; Back to Products
          </button>

          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {product.name}
          </h1>
          <p className="text-gray-600 mb-6">{product.description}</p>

          <p className="text-3xl font-extrabold text-green-600 mb-6">
            BDT {product.price}
          </p>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4 mb-6">
            <label className="font-medium text-gray-700">Quantity:</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="border rounded-md p-2 w-20 focus:ring-2 focus:ring-green-400 focus:outline-none"
            />
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full md:w-auto bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
