import React, { useState, useEffect } from "react";
import axios from "axios";

// API Base URL
const API_URL = "http://localhost:8000/api/products/"; // change if needed

// Card Component
const Card = ({ title, value, bgColor }) => (
  <div
    className={`flex-1 min-w-[150px] text-center rounded-lg p-6 shadow-md text-white ${bgColor}`}
  >
    <h3 className="text-sm mb-2">{title}</h3>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

// Product CRUD Section
const ProductCRUD = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    image: null,
  });
  const [editingId, setEditingId] = useState(null);

  // ✅ Fetch products from Django on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(API_URL);
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const resetForm = () => {
    setFormData({ name: "", price: "", stock: "", image: null });
    setEditingId(null);
  };

  // ✅ Add / Update product
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", formData.price);
    data.append("stock", formData.stock);
    if (formData.image) data.append("image", formData.image);

    try {
      if (editingId) {
        // Update product
        await axios.put(`${API_URL}${editingId}/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // Add product
        await axios.post(API_URL, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      fetchProducts(); // refresh list
      resetForm();
    } catch (err) {
      console.error("Error saving product:", err);
    }
  };

  // ✅ Edit product
  const handleEdit = (p) => {
    setEditingId(p.id);
    setFormData({ name: p.name, price: p.price, stock: p.stock, image: null });
  };

  // ✅ Delete product
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}${id}/`);
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">
        {editingId ? "Edit Product" : "Add Product"}
      </h2>

      {/* Form */}
      <form className="flex flex-col gap-4 mb-6" onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={formData.name}
            onChange={handleChange}
            className="border rounded p-2 flex-1"
            maxLength={50}
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            className="border rounded p-2 flex-1"
            required
          />
          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={formData.stock}
            onChange={handleChange}
            className="border rounded p-2 flex-1"
            required
          />
          {/* Shorter file input */}
          <input
            type="file"
            name="image"
            onChange={handleChange}
            className="border rounded p-1 w-40"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition mt-2 w-full sm:w-auto"
        >
          {editingId ? "Update" : "Add"}
        </button>
      </form>

         {/* Product List */}
         <ul className="space-y-2">
             {products.map((p) => (
          <li
          key={p.id}
           className="flex justify-between items-center border rounded p-2"
          >
      <div className="flex items-center gap-4">
        {/* ✅ Show product photo if available */}
        {p.image_url && (
          <img
            src={p.image_url}
            alt={p.name}
            className="w-80 h-80 object-cover rounded"
          />
        )}
        <span>
          {p.name} - ${p.price} - Stock: {p.stock}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => handleEdit(p)}
          className="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500 transition"
        >
          Edit
        </button>
        <button
          onClick={() => handleDelete(p.id)}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
        >
          Delete
        </button>
      </div>
    </li>
  ))}
</ul>

    </div>
  );
};

// Dashboard
const AdminEcommerce = () => {
  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">E-commerce Dashboard</h1>

        {/* Cards */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <Card title="Orders Today" value="0" bgColor="bg-green-500" />
          <Card title="Revenue Today" value="$0" bgColor="bg-blue-500" />
          <Card title="Refunds (7d)" value="$0" bgColor="bg-red-500" />
          <Card title="Low-Stock Products" value="0" bgColor="bg-yellow-500" />
        </div>

        {/* Product CRUD */}
        <ProductCRUD />

        {/* Placeholders */}
        <div className="mt-10 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-2">Coupon Management (CRUD Placeholder)</h2>
            <p className="text-gray-500">Feature to create/edit coupons goes here.</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-2">Order Management (CRUD Placeholder)</h2>
            <p className="text-gray-500">Feature to create test orders, capture/refund, add notes.</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-2">Review Management (CRUD Placeholder)</h2>
            <p className="text-gray-500">Feature to approve/hide customer reviews.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEcommerce;
