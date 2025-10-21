import React, { useState, useEffect } from "react";
import api from "../../api";

const AdminServicesBookings = () => {
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image: null,
    assigned_vendor_ids: [],
  });
  const [editingId, setEditingId] = useState(null);
  const [completionForm, setCompletionForm] = useState({
    show: null,
    photo: null,
  });
  const [refundForm, setRefundForm] = useState({
    show: null,
    bookingId: null,
    amount: "",
    reason: "",
  });
  const [fileKey, setFileKey] = useState(Date.now());

  // ------------------ Fetchers ------------------
  const fetchServices = async () => {
    try {
      const res = await api.get("/services/");
      setServices(res.data);
      console.log("Services fetched:", res.data);
    } catch (err) {
      console.error("fetchServices error:", err.response?.data || err);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await api.get("/vendors/");
      setVendors(res.data);
      console.log("Vendors fetched:", res.data);
    } catch (err) {
      console.error("fetchVendors error:", err.response?.data || err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings/");
      setBookings(res.data);
      console.log("Bookings fetched:", res.data);
    } catch (err) {
      console.error("fetchBookings error:", err.response?.data || err);
    }
  };

  const fetchRefunds = async () => {
    try {
      const res = await api.get("/refunds/");
      setRefunds(res.data);
      console.log("Refunds fetched:", res.data);
    } catch (err) {
      console.error("fetchRefunds error:", err.response?.data || err);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchVendors();
    fetchBookings();
    fetchRefunds();
  }, []);

  // ------------------ Form Handlers ------------------
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData((prev) => ({ ...prev, image: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleVendorToggle = (vendorId) => {
    setFormData((prev) => {
      const strId = vendorId.toString();
      const exists = prev.assigned_vendor_ids.includes(strId);
      return {
        ...prev,
        assigned_vendor_ids: exists
          ? prev.assigned_vendor_ids.filter((id) => id !== strId)
          : [...prev.assigned_vendor_ids, strId],
      };
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      description: "",
      image: null,
      assigned_vendor_ids: [],
    });
    setEditingId(null);
    setFileKey(Date.now());
    fetchServices();
  };

  const handleEdit = (service) => {
    setFormData({
      name: service.name,
      price: service.price,
      description: service.description,
      image: null,
      assigned_vendor_ids: service.assigned_vendors.map((v) => String(v.id)),
    });
    setEditingId(service.id);
    setFileKey(Date.now());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", formData.price);
    data.append("description", formData.description);
    if (formData.image) data.append("image", formData.image);
    formData.assigned_vendor_ids.forEach((id) =>
      data.append("assigned_vendor_ids", id)
    );

    console.log("Submitting service form:");
    for (let [key, value] of data.entries()) console.log(key, value);

    try {
      let res;
      if (editingId) {
        res = await api.put(`/services/${editingId}/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("Service updated response:", res.data);
        alert("Service updated successfully!");
      } else {
        res = await api.post("/services/", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("Service created response:", res.data);
        alert("Service added successfully!");
      }
      resetForm();
    } catch (err) {
      console.error("handleSubmit error:", err.response?.data || err);
      alert("Error submitting service, check console.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?"))
      return;
    try {
      const res = await api.delete(`/services/${id}/`);
      console.log("Deleted service response:", res.data);
      fetchServices();
    } catch (err) {
      console.error("handleDelete error:", err.response?.data || err);
    }
  };

  // ------------------ Booking handlers ------------------
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const res = await api.patch(`/bookings/${bookingId}/`, {
        status: newStatus,
      });
      console.log(`Booking ${bookingId} status updated:`, res.data);
      fetchBookings();
    } catch (err) {
      console.error("handleStatusChange error:", err.response?.data || err);
    }
  };

  const handleCompletionPhotoChange = (e) =>
    setCompletionForm((prev) => ({ ...prev, photo: e.target.files[0] }));

  const handleCompleteBooking = async (e, bookingId) => {
    e.preventDefault();
    if (!completionForm.photo) return alert("Upload completion photo!");

    const data = new FormData();
    data.append("completed_photo", completionForm.photo);
    data.append("status", "Completed");

    console.log("Submitting completion photo for booking", bookingId);
    for (let [key, value] of data.entries()) console.log(key, value);

    try {
      const res = await api.patch(`/bookings/${bookingId}/`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Booking completion response:", res.data);
      alert("Booking marked as completed!");
      setCompletionForm({ show: null, photo: null });
      fetchBookings();
    } catch (err) {
      console.error("handleCompleteBooking error:", err.response?.data || err);
    }
  };

  // ------------------ Refund handlers ------------------
  const openRefundForm = (booking) =>
    setRefundForm({
      show: booking.id,
      bookingId: booking.id,
      amount: booking.service.price,
      reason: `Refund for ${booking.service.name}`,
    });

  const handleRefundChange = (e) =>
    setRefundForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    if (!refundForm.bookingId) return;
    console.log("Submitting refund:", refundForm);

    try {
      const resPost = await api.post("/refunds/", {
        booking_id: refundForm.bookingId,
        amount: refundForm.amount,
        reason: refundForm.reason,
        status: "Pending",
      });
      console.log("Refund created:", resPost.data);
      const resDel = await api.delete(`/bookings/${refundForm.bookingId}/`);
      console.log("Booking deleted after refund:", resDel.data);

      alert("Refund submitted!");
      setRefundForm({ show: null, bookingId: null, amount: "", reason: "" });
      fetchBookings();
      fetchRefunds();
    } catch (err) {
      console.error("handleRefundSubmit error:", err.response?.data || err);
    }
  };

  // ------------------ Render ------------------
  const today = new Date().setHours(0, 0, 0, 0);
  const overdueBookings = bookings
    .filter(
      (b) =>
        b.status !== "Completed" &&
        new Date(b.booking_date).setHours(0, 0, 0, 0) < today
    )
    .sort((a, b) => new Date(a.booking_date) - new Date(b.booking_date));

  const upcomingBookings = bookings
    .filter(
      (b) =>
        b.status !== "Completed" &&
        new Date(b.booking_date).setHours(0, 0, 0, 0) >= today
    )
    .sort((a, b) => new Date(a.booking_date) - new Date(b.booking_date));

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Manage Services & Bookings
      </h1>

      {/* ------------------ Service Form ------------------ */}
      <div className="bg-white shadow-md rounded-2xl p-6 mb-10">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? "Edit Service" : "Add New Service"}
        </h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="border rounded-md p-2"
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            className="border rounded-md p-2"
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="border rounded-md p-2"
          />
          <input
            key={fileKey}
            type="file"
            name="image"
            onChange={handleChange}
            className="border rounded-md p-2"
          />
          <label className="font-medium text-gray-700">Assign Vendors</label>
          <div className="border rounded-md p-2 max-h-40 overflow-y-auto space-y-1">
            {vendors.map((vendor) => (
              <label
                key={vendor.id}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
              >
                <input
                  type="checkbox"
                  checked={formData.assigned_vendor_ids.includes(
                    String(vendor.id)
                  )}
                  onChange={() => handleVendorToggle(vendor.id)}
                />
                <span>
                  {vendor.username}{" "}
                  <span className="text-sm text-gray-500">({vendor.area})</span>
                </span>
              </label>
            ))}
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
          >
            {editingId ? "Update Service" : "Add Service"}
          </button>
        </form>
      </div>

      {/* ------------------ Services List ------------------ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white shadow rounded-2xl p-4 flex flex-col"
          >
            {service.image && (
              <img
                src={
                  service.image.startsWith("http")
                    ? service.image
                    : `http://127.0.0.1:8000${service.image}`
                }
                alt={service.name}
                className="w-full h-40 object-cover rounded mb-3"
              />
            )}
            <h3 className="text-lg font-semibold text-gray-800">
              {service.name}
            </h3>
            <p className="text-green-700 font-bold mb-1">${service.price}</p>
            <p className="text-gray-600 mb-2">{service.description}</p>
            {service.assigned_vendors.length > 0 && (
              <div className="text-sm text-gray-700">
                <span className="font-semibold">Vendors:</span>{" "}
                {service.assigned_vendors
                  .map((v) => `${v.id}. ${v.username} (${v.area})`)
                  .join(", ")}
              </div>
            )}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleEdit(service)}
                className="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(service.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ------------------ Bookings & Refunds ------------------ */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Bookings</h2>
        {[...overdueBookings, ...upcomingBookings].map((b) => (
          <div
            key={b.id}
            className="bg-white shadow rounded-lg p-4 mb-3 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">
                {b.service.name} - {b.customer.name}
              </p>
              <p>Date: {b.booking_date}</p>
              <p>Address: {b.address}</p>
              <p>Contact: {b.contact_number}</p>
              <p>Status: {b.status}</p>
            </div>

            <div className="flex gap-2 flex-col sm:flex-row">
              {b.status === "Not Accepted" && (
                <button
                  className="bg-green-500 px-2 py-1 text-white rounded"
                  onClick={() => handleStatusChange(b.id, "Pending")}
                >
                  Accept
                </button>
              )}
              {b.status === "Pending" && (
                <button
                  className="bg-blue-500 px-2 py-1 text-white rounded"
                  onClick={() => handleStatusChange(b.id, "In Progress")}
                >
                  Start
                </button>
              )}
              {b.status === "In Progress" && (
                <button
                  className="bg-purple-500 px-2 py-1 text-white rounded"
                  onClick={() => setCompletionForm({ show: b.id, photo: null })}
                >
                  Complete
                </button>
              )}
              {b.status !== "In Progress" && b.status !== "Completed" && (
                <button
                  className="bg-red-500 px-2 py-1 text-white rounded"
                  onClick={() => openRefundForm(b)}
                >
                  Refund
                </button>
              )}
            </div>

            {completionForm.show === b.id && (
              <form
                className="flex flex-col gap-2 mt-2"
                onSubmit={(e) => handleCompleteBooking(e, b.id)}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCompletionPhotoChange}
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-2 py-1 rounded"
                >
                  Submit Completion
                </button>
              </form>
            )}

            {refundForm.show === b.id && (
              <form
                className="flex flex-col gap-2 mt-2"
                onSubmit={handleRefundSubmit}
              >
                <input
                  type="number"
                  name="amount"
                  value={refundForm.amount}
                  onChange={handleRefundChange}
                  className="border rounded p-2"
                  required
                />
                <input
                  type="text"
                  name="reason"
                  value={refundForm.reason}
                  onChange={handleRefundChange}
                  className="border rounded p-2"
                  required
                />
                <button
                  type="submit"
                  className="bg-orange-600 text-white px-2 py-1 rounded"
                >
                  Submit Refund
                </button>
              </form>
            )}
          </div>
        ))}

        {/* Completed Bookings */}
        <h2 className="text-2xl font-bold mt-10 mb-4">Completed Bookings</h2>
        {bookings
          .filter((b) => b.status === "Completed")
          .map((b) => (
            <div
              key={b.id}
              className="bg-gray-100 shadow rounded-lg p-4 mb-3 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">
                  {b.service.name} - {b.customer.name}
                </p>
                <p>Date: {b.booking_date}</p>
                <p>Address: {b.address}</p>
                <p>Notes: {b.notes}</p>
                {b.completed_photo && (
                  <img
                    src={
                      b.completed_photo.startsWith("http")
                        ? b.completed_photo
                        : `http://127.0.0.1:8000${b.completed_photo}`
                    }
                    alt="Proof"
                    className="w-32 h-32 object-cover mt-2 rounded"
                  />
                )}
              </div>
            </div>
          ))}
      </div>

      {/* Refunds */}
      {refunds.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4 text-orange-600">
            💰 Refunds
          </h2>
          {refunds.map((r) => (
            <div
              key={r.id}
              className="bg-yellow-100 shadow rounded-lg p-4 mb-3 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">Booking ID: {r.booking.id}</p>
                <p>Customer: {r.booking.customer.name}</p>
                <p>Service Requested: {r.booking.service.name}</p>
                <p>Amount: ${r.amount}</p>
                <p>Reason: {r.reason}</p>
                <p>Status: {r.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminServicesBookings;
