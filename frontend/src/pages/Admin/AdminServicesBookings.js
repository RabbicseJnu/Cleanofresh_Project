import React, { useState, useEffect } from "react";
import api from "../../api";

const AdminServicesBookings = () => {
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [activeRefundTab, setActiveRefundTab] = useState(
    "Refunded But Pending"
  );
  const [vendors, setVendors] = useState([]);
  const [types, setTypes] = useState([]);
  const [subtypes, setSubtypes] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image: null,
    assigned_vendor_ids: [],
    service_type: "",
    service_subtype: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [refundForm, setRefundForm] = useState({
    show: null,
    bookingId: null,
    amount: "",
    reason: "",
  });
  const [fileKey, setFileKey] = useState(Date.now());
  const [activeTab, setActiveTab] = useState("Not Accepted");

  // ------------------ Fetchers ------------------
  const fetchServices = async () => {
    try {
      const res = await api.get("/services/");
      setServices(res.data);
    } catch (err) {
      console.error("fetchServices error:", err.response?.data || err);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await api.get("/vendors/");
      setVendors(res.data);
    } catch (err) {
      console.error("fetchVendors error:", err.response?.data || err);
    }
  };

  const fetchTypes = async () => {
    try {
      const res = await api.get("/services/types/");
      setTypes(res.data);
    } catch (err) {
      console.error("fetchTypes error:", err.response?.data || err);
    }
  };

  const fetchSubtypes = async (type) => {
    if (!type) return setSubtypes([]);
    try {
      const res = await api.get(`/services/subtypes/?type=${type}`);
      setSubtypes(res.data);
    } catch (err) {
      console.error("fetchSubtypes error:", err.response?.data || err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings/");
      setBookings(res.data);
    } catch (err) {
      console.error("fetchBookings error:", err.response?.data || err);
    }
  };

  const fetchRefunds = async () => {
    try {
      const res = await api.get("/refunds/");
      setRefunds(res.data);
    } catch (err) {
      console.error("fetchRefunds error:", err.response?.data || err);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchVendors();
    fetchBookings();
    fetchRefunds();
    fetchTypes();
  }, []);

  // ------------------ Service Handlers ------------------
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData((prev) => ({ ...prev, image: files[0] }));
    } else if (name === "service_type") {
      setFormData((prev) => ({
        ...prev,
        service_type: value,
        service_subtype: "",
      }));
      fetchSubtypes(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleVendorToggle = (vendorId) => {
    setFormData((prev) => {
      const strId = vendorId.toString();
      return {
        ...prev,
        assigned_vendor_ids: prev.assigned_vendor_ids.includes(strId)
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
      service_type: "",
      service_subtype: "",
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
      service_type: service.service_type || "",
      service_subtype: service.service_subtype || "",
    });
    if (service.service_type) fetchSubtypes(service.service_type);
    setEditingId(service.id);
    setFileKey(Date.now());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", formData.price);
    data.append("description", formData.description);
    data.append("service_type", formData.service_type);
    data.append("service_subtype", formData.service_subtype);
    if (formData.image) data.append("image", formData.image);
    formData.assigned_vendor_ids.forEach((id) =>
      data.append("assigned_vendor_ids", id)
    );

    try {
      if (editingId) {
        await api.put(`/services/${editingId}/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Service updated successfully!");
      } else {
        await api.post("/services/", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
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
      await api.delete(`/services/${id}/`);
      fetchServices();
    } catch (err) {
      console.error("handleDelete error:", err.response?.data || err);
    }
  };

  // ------------------ Vendor Assignment ------------------
  const getAvailableVendorsForBooking = (booking) => {
    if (!booking) return [];

    let service = null;

    // --- resolve service object ---
    if (booking.service_id) {
      service = services.find((s) => s.id === booking.service_id);
    } else if (
      typeof booking.service === "object" &&
      booking.service !== null
    ) {
      service = services.find((s) => s.id === booking.service.id);
    } else if (typeof booking.service === "string") {
      const cleanName = booking.service.split(" ($")[0];
      service = services.find((s) => s.name === cleanName);
    }

    if (!service) {
      console.warn("No service found for booking", booking);
      return [];
    }

    const customerArea = booking.customer?.area || null;
    const bookingDate = new Date(booking.start_datetime);
    const bookingTime = bookingDate.getTime();
    const bookingDay = bookingDate.toLocaleString("en-US", {
      weekday: "long",
      timeZone: "Asia/Dhaka",
    });

    console.group(`Vendor filtering for booking #${booking.id}`);
    console.log("Service:", service);
    console.log("Customer area:", customerArea);
    console.log("Booking day/time:", bookingDay, bookingDate.toLocaleString());

    let filtered = vendors;

    // --- filter by service type ---
    filtered = filtered.filter((vendor) => {
      const pass = vendor.services?.some(
        (s) => s.toLowerCase() === booking.service.service_type.toLowerCase()
      );
      if (!pass)
        console.log(`❌ ${vendor.username} dropped (service mismatch)`, {
          vendorService: vendor.service,
          bookingService: service.service_type,
        });
      return pass;
    });

    // --- filter by subtype ---
    filtered = filtered.filter((vendor) => {
      const pass =
        vendor.skills
          ?.map((sk) => sk.toLowerCase())
          .includes((service.service_subtype || "").toLowerCase()) ?? false;
      if (!pass)
        console.log(`❌ ${vendor.username} dropped (subtype mismatch)`, {
          vendorSkills: vendor.skills,
          bookingSubtype: service.service_subtype,
        });
      return pass;
    });

    // --- filter by area ---
    filtered = filtered.filter((vendor) => {
      const pass = customerArea && vendor.area && vendor.area === customerArea;
      if (!pass)
        console.log(`❌ ${vendor.username} dropped (area mismatch)`, {
          vendorArea: vendor.area,
          customerArea,
        });
      return pass;
    });

    // --- filter by slot/time ---
    filtered = filtered.filter((vendor) => {
      const slotMatch = vendor.slots?.some((slot) => {
        if (!slot.day || !slot.start_time || !slot.end_time) return false;
        const dayMatch = bookingDay === slot.day;
        if (!dayMatch) return false;

        const [sH, sM] = slot.start_time.split(":").map(Number);
        const [eH, eM] = slot.end_time.split(":").map(Number);

        const slotStart = new Date(bookingDate);
        slotStart.setHours(sH, sM, 0, 0);
        const slotEnd = new Date(bookingDate);
        slotEnd.setHours(eH, eM, 0, 0);

        return (
          bookingTime >= slotStart.getTime() && bookingTime <= slotEnd.getTime()
        );
      });

      if (!slotMatch)
        console.log(`❌ ${vendor.username} dropped (no slot match)`, {
          slots: vendor.slots,
          bookingDay,
          bookingTime: bookingDate.toLocaleTimeString(),
        });
      return slotMatch;
    });

    console.log(
      "✅ Eligible vendors:",
      filtered.map((v) => v.username)
    );
    console.groupEnd();

    return filtered;
  };

  const handleAssignVendor = async (bookingId, vendorId, accept = false) => {
    if (!vendorId) return alert("Select a vendor first!");
    try {
      await api.patch(`/bookings/${bookingId}/`, {
        vendor_id: vendorId,
        status: accept ? "Pending" : undefined,
      });
      fetchBookings();
    } catch (err) {
      console.error("handleAssignVendor error:", err.response?.data || err);
    }
  };

  // ------------------ Group Bookings by Status ------------------
  const today = new Date();
  const groupedBookings = bookings.reduce(
    (acc, b) => {
      if (b.status === "Completed") {
        acc["Completed"].push(b);
      } else if (new Date(b.start_datetime) < today) {
        acc["Overdue"].push(b);
      } else {
        if (!acc[b.status]) acc[b.status] = [];
        acc[b.status].push(b);
      }
      return acc;
    },
    {
      "Not Accepted": [],
      Pending: [],
      "In Progress": [],
      Completed: [],
      Overdue: [],
    }
  );

  const STATUS_TABS = [
    "Not Accepted",
    "Pending",
    "In Progress",
    "Overdue",
    "Completed",
  ];

  // ------------------ Refund Handlers ------------------
  const refundReasons = [
    "Customer requested",
    "Service issue",
    "Overcharge",
    "Other",
  ];

  const openRefundForm = (booking) => {
    setRefundForm({
      show: booking.id,
      bookingId: booking.id,
      amount: booking.total_price || 0,
      reason: refundReasons[0], // default first option
      customReason: "",
    });
  };

  const handleRefundChange = (e) => {
    const { name, value } = e.target;
    setRefundForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    if (!refundForm.bookingId) return;

    try {
      // Determine final reason
      const finalReason =
        refundForm.reason === "Other"
          ? refundForm.customReason
          : refundForm.reason;

      // Create refund with Approved status
      await api.post("/refunds/", {
        booking_id: refundForm.bookingId,
        amount: refundForm.amount,
        reason: finalReason,
        status: "Approved",
      });

      // Update booking to refunded
      await api.patch(`/bookings/${refundForm.bookingId}/`, {
        status: "Refunded",
      });

      alert("Refund processed successfully!");

      setRefundForm({
        show: null,
        bookingId: null,
        amount: "",
        reason: "",
        customReason: "",
      });
      fetchBookings();
      fetchRefunds();
    } catch (err) {
      console.error("handleRefundSubmit error:", err.response?.data || err);
      alert("Error processing refund, check console.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Manage Services & Bookings</h1>

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
          <label>Service Type</label>
          <select
            name="service_type"
            value={formData.service_type}
            onChange={handleChange}
            className="border rounded-md p-2"
            required
          >
            <option value="">Select Type</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <label>Service Subtype</label>
          <select
            name="service_subtype"
            value={formData.service_subtype}
            onChange={handleChange}
            className="border rounded-md p-2"
            required
          >
            <option value="">Select Subtype</option>
            {subtypes.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
          <input
            key={fileKey}
            type="file"
            name="image"
            onChange={handleChange}
            className="border rounded-md p-2"
          />
          <label>Assign Vendors</label>
          <div className="border p-2 max-h-40 overflow-y-auto space-y-1">
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
                {vendor.username} ({vendor.area})
              </label>
            ))}
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {editingId ? "Update Service" : "Add Service"}
          </button>
        </form>
      </div>

      {/* ------------------ Services List ------------------ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
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
            <h3 className="text-lg font-semibold">{service.name}</h3>
            <p className="text-green-700 font-bold mb-1">${service.price}</p>
            <p className="text-gray-600 mb-1">{service.description}</p>
            {service.service_type && (
              <p className="text-sm">
                <strong>Type:</strong> {service.service_type}{" "}
                {service.service_subtype && `(${service.service_subtype})`}
              </p>
            )}
            {service.assigned_vendors?.length > 0 && (
              <p className="text-sm">
                <strong>Vendors:</strong>{" "}
                {service.assigned_vendors.map((v) => v.username).join(", ")}
              </p>
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

      {/* ------------------ Bookings ------------------ */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Bookings</h2>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          {STATUS_TABS.map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`px-4 py-2 rounded-lg font-semibold ${
                activeTab === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {status} ({groupedBookings[status]?.length || 0})
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {groupedBookings[activeTab]?.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {groupedBookings[activeTab].map((b) => (
              <li
                key={b.id}
                className={`py-4 px-4 flex flex-col md:flex-row justify-between bg-white rounded-lg mb-3 shadow-sm transition-all duration-300 ${
                  refundForm.show === b.id ? "opacity-80" : "opacity-100"
                }`}
              >
                <div className="space-y-1 text-gray-800">
                  <p>
                    <strong>Service:</strong>{" "}
                    {typeof b.service === "object" && b.service !== null
                      ? b.service.name
                      : b.service}
                  </p>
                  <p>
                    <strong>Type / Subtype:</strong>{" "}
                    {typeof b.service === "object" && b.service !== null
                      ? `${b.service.service_type || ""} ${
                          b.service.service_subtype
                            ? `(${b.service.service_subtype})`
                            : ""
                        }`
                      : `${b.service_type || ""} ${
                          b.service_subtype ? `(${b.service_subtype})` : ""
                        }`}
                  </p>
                  <p>
                    <strong>Price:</strong> ${b.total_price}
                  </p>
                  <p>
                    <strong>Customer:</strong> {b.name}
                  </p>
                  <p>
                    <strong>Phone:</strong> {b.contact_number}
                  </p>
                  <p>
                    <strong>Address:</strong> {b.address}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(b.start_datetime).toLocaleString()}
                  </p>
                  <p>
                    <strong>Status:</strong> {b.status}
                  </p>
                  <p>
                    <strong>Vendor:</strong>{" "}
                    {b.vendor?.username || "Unassigned"}
                  </p>
                  {b.status === "Completed" && b.completed_photo && (
                    <div className="mt-2">
                      <span className="font-semibold">Completed Photo:</span>
                      <img
                        src={b.completed_photo}
                        alt="Completed work"
                        className="mt-1 max-w-xs rounded border"
                      />
                    </div>
                  )}
                </div>

                {/* Admin Actions */}
                <div className="mt-2 md:mt-0 flex flex-col gap-2">
                  {refundForm.show !== b.id && (
                    <>
                      {b.status === "Not Accepted" && (
                        <div className="flex flex-col gap-2">
                          <select
                            value={b.selectedVendorId || ""}
                            onChange={(e) =>
                              setBookings((prev) =>
                                prev.map((bk) =>
                                  bk.id === b.id
                                    ? {
                                        ...bk,
                                        selectedVendorId: e.target.value,
                                      }
                                    : bk
                                )
                              )
                            }
                            className="border p-1 rounded"
                          >
                            <option value="">Select Vendor</option>
                            {getAvailableVendorsForBooking(b).map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.username} ({v.area})
                              </option>
                            ))}
                          </select>
                          <button
                            className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                            onClick={() =>
                              handleAssignVendor(b.id, b.selectedVendorId, true)
                            }
                          >
                            Accept & Assign
                          </button>
                        </div>
                      )}
                      {b.status !== "Completed" && b.status !== "Refunded" && (
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                          onClick={() => openRefundForm(b)}
                        >
                          Refund
                        </button>
                      )}
                    </>
                  )}

                  {refundForm.show === b.id && (
                    <form
                      onSubmit={handleRefundSubmit}
                      className="flex flex-col gap-2 mt-2 p-3 bg-gray-50 rounded-lg shadow transition-all duration-300"
                    >
                      <input
                        type="number"
                        name="amount"
                        value={refundForm.amount}
                        onChange={handleRefundChange}
                        className="border p-2 rounded"
                        required
                      />
                      <select
                        name="reason"
                        value={refundForm.reason}
                        onChange={handleRefundChange}
                        className="border p-2 rounded"
                        required
                      >
                        {refundReasons.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      {refundForm.reason === "Other" && (
                        <input
                          type="text"
                          name="customReason"
                          placeholder="Enter reason"
                          value={refundForm.customReason}
                          onChange={handleRefundChange}
                          className="border p-2 rounded"
                          required
                        />
                      )}
                      <button
                        type="submit"
                        className="bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700 transition"
                      >
                        Submit Refund
                      </button>
                      <button
                        type="button"
                        className="bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500 transition mt-1"
                        onClick={() =>
                          setRefundForm({
                            show: null,
                            bookingId: null,
                            amount: "",
                            reason: "",
                            customReason: "",
                          })
                        }
                      >
                        Cancel
                      </button>
                    </form>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">
            No {activeTab.toLowerCase()} bookings.
          </p>
        )}
      </div>

      {/* ------------------ Refunds for Admin ------------------ */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Refunds</h2>
        {/* Tabs */}
        <div className="flex space-x-2 mb-4">
          {["Pending", "Approved", "Rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setActiveRefundTab(status)}
              className={`px-4 py-2 rounded-lg font-semibold ${
                activeRefundTab === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {status} ({refunds.filter((r) => r.status === status).length})
            </button>
          ))}
        </div>
        {/* Refunds List */}
        {refunds.filter((r) => r.status === activeRefundTab).length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {refunds
              .filter((r) => r.status === activeRefundTab)
              .map((r) => (
                <li
                  key={r.id}
                  className="py-4 px-4 flex flex-col md:flex-row justify-between bg-white rounded-lg mb-3 shadow-sm"
                >
                  <div className="space-y-1 text-gray-800">
                    <p>
                      <strong>Customer:</strong> {r.booking.customer.name}
                    </p>
                    <p>
                      <strong>Service:</strong> {r.booking.service.name}
                    </p>
                    <p>
                      <strong>Amount:</strong> ${r.amount}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span
                        className={`px-2 py-1 rounded text-sm font-semibold ${
                          r.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : r.status === "Rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {r.status}
                      </span>
                    </p>
                  </div>

                  {/* Pending Actions */}
                  {activeRefundTab === "Pending" && (
                    <div className="flex gap-2 mt-2 md:mt-0">
                      <button
                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                        onClick={async () => {
                          try {
                            await api.patch(`/refunds/${r.id}/`, {
                              status: "Approved",
                            });
                            await api.patch(`/bookings/${r.booking.id}/`, {
                              status: "Refunded",
                            });
                            fetchRefunds();
                            fetchBookings();
                          } catch (err) {
                            console.error(err.response?.data || err);
                          }
                        }}
                      >
                        Accept
                      </button>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        onClick={async () => {
                          try {
                            await api.patch(`/refunds/${r.id}/`, {
                              status: "Rejected",
                            });
                            await api.patch(`/bookings/${r.booking.id}/`, {
                              status: "Refunded But Rejected",
                            });
                            fetchRefunds();
                            fetchBookings();
                          } catch (err) {
                            console.error(err.response?.data || err);
                          }
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </li>
              ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic mt-2">
            No refunds in this category.
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminServicesBookings;
