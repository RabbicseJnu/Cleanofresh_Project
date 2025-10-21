// src/pages/BookingPage.js
import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ArrowLeft } from "lucide-react"; // 👈 add this import at the top

const BookingPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // state passed from ServiceInfo
  const {
    service,
    extras: passedExtras,
    initialFormData,
    customerId: initCustomerId,
  } = state || {};

  // local states (hooks are always at top)
  const [formData, setFormData] = useState(
    () =>
      initialFormData || {
        name: "",
        address: "",
        area: "",
        contact_number: "",
        date: null,
        start_time: "",
        notes: "",
        selectedServices: [],
        paymentMethod: "Card",
      }
  );
  const [extras, setExtras] = useState(passedExtras || []);
  const [formErrors, setFormErrors] = useState({});
  const [customerId, setCustomerId] = useState(initCustomerId || null);
  const [loading, setLoading] = useState(false);

  // If extras were not passed, try fetching them using service.service_subtype
  useEffect(() => {
    const fetchExtras = async () => {
      if ((extras || []).length > 0) return;
      if (!service?.service_subtype) return;
      try {
        const res = await api.get(
          `/services/extras/?subtype=${service.service_subtype}`
        );
        setExtras(res.data.extras || []);
      } catch (err) {
        console.error("Error fetching extras:", err);
      }
    };
    fetchExtras();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service]);

  // total calculation (always called)
  const selectedTotal = useMemo(() => {
    const basePrice = Number(service?.price) || 0;
    const detailsTotal = (formData.selectedServices || []).reduce(
      (sum, s) => sum + (Number(s.price) || 0),
      0
    );
    const notesFee = formData.notes?.trim() ? 500 : 0;
    return basePrice + detailsTotal + notesFee;
  }, [formData.selectedServices, service, formData.notes]);

  // validate all fields (page shows everything)
  const validateAll = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.address.trim()) errors.address = "Address is required";
    if (!formData.area || !formData.area.trim()) errors.area = "Area is required";
    if (!formData.contact_number.trim())
      errors.contact_number = "Contact number is required";
    if (!formData.date) errors.date = "Please select a valid date";
    if (!formData.start_time) errors.start_time = "Please select a start time";
    if (!formData.paymentMethod) errors.paymentMethod = "Select a payment method";
    return errors;
  };

  // ensure customer record exists (same as your ServiceInfo logic)
  const ensureCustomerRecord = async () => {
    if (customerId) return customerId;
    try {
      const res = await api.post("/customers/", {
        address: formData.address,
        area: formData.area,
        phone: formData.contact_number,
      });
      setCustomerId(res.data.id);
      return res.data.id;
    } catch (err) {
      throw err;
    }
  };

  // submit booking + payment flow (adapted from your ServiceInfo)
  const handleSubmit = async () => {
    const errs = validateAll();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setLoading(true);

      const custId = await ensureCustomerRecord();

      const startDatetime = new Date(formData.date);
      const [hours, minutes] = formData.start_time.split(":");
      startDatetime.setHours(parseInt(hours || "0", 10), parseInt(minutes || "0", 10), 0, 0);

      const bookingBody = {
        service_id: service.id,
        customer_id: custId,
        start_datetime: startDatetime.toISOString(),
        name: formData.name,
        address: formData.address,
        area: formData.area,
        contact_number: formData.contact_number,
        notes: formData.notes || "",
        details: formData.selectedServices || [],
        payment_method: formData.paymentMethod || "Card",
      };

      const bookingRes = await api.post("/bookings/", bookingBody);
      const bookingId = bookingRes.data.id;

      if (formData.paymentMethod === "Card") {
        const paymentRes = await api.post("/payments/initiate/", {
          booking_id: bookingId,
        });
        if (paymentRes.data.payment_url) {
          window.location.href = paymentRes.data.payment_url; // redirect to SSLCOMMERZ
          return;
        } else {
          alert("Failed to initiate payment. Try again.");
        }
      } else if (formData.paymentMethod === "Bkash") {
        alert(
          "Booking created! Please pay via Bkash to confirm your booking.\n" +
            `Booking ID: ${bookingId}`
        );
      }

      setLoading(false);
      navigate(`/service/${service.id}`); // go back to service page after offline payment
    } catch (err) {
      setLoading(false);
      console.error("Booking/payment submission error:", err?.response?.data || err);
      alert(
        "Booking failed: " +
          JSON.stringify(err?.response?.data || err?.message || err, null, 2)
      );
    }
  };

  // if page opened directly without state (no service), show message
if (!service) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="mb-4">
          No service selected. Please go back and click Book Now.
        </p>

        <div className="flex gap-3 justify-center">
          {/* Back Button as Arrow */}
          <button
  onClick={() => navigate(-1)}
  className="fixed top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-full bg-gray-200 shadow hover:bg-gray-300 z-50"
          >
            <ArrowLeft className="w-5 h-5" /> {/* 👈 arrow icon */}
            <span>Back</span>
          </button>

          {/* Browse Services */}
          <button
            onClick={() => navigate("/services")}
            className="px-4 py-2 rounded bg-green-600 text-white"
          >
            Browse Services
          </button>
        </div>
      </div>
    </div>
  );
}

  // --- UI ---
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-12 px-6 flex gap-8">
        {/* Left: Form */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Complete your booking</h1>
<button

  onClick={() => navigate(-1)}
  className="fixed top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-full bg-gray-200 shadow hover:bg-gray-300 z-50"
>
  <ArrowLeft className="w-5 h-5" />
  <span></span>
</button>
          </div>

          {/* Customer Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-3">Customer Info</h2>
            <div className="space-y-3">
              <input
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 border rounded"
              />
              {formErrors.name && <p className="text-red-600 text-sm">{formErrors.name}</p>}

              <input
                placeholder="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-3 border rounded"
              />
              {formErrors.address && <p className="text-red-600 text-sm">{formErrors.address}</p>}

              <select
                value={formData.area || ""}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full p-3 border rounded"
              >
                <option value="">-- Select Area --</option>
                {["Banasree", "Mirpur", "Badda", "Gulshan"].map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              {formErrors.area && <p className="text-red-600 text-sm">{formErrors.area}</p>}

              <input
                placeholder="Contact Number"
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                className="w-full p-3 border rounded"
              />
              {formErrors.contact_number && <p className="text-red-600 text-sm">{formErrors.contact_number}</p>}
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-3">Schedule</h2>
            <DatePicker
              selected={formData.date}
              onChange={(date) => setFormData({ ...formData, date })}
              minDate={new Date()}
              className="w-full p-3 border rounded mb-3"
              placeholderText="Select a date"
            />
            {formErrors.date && <p className="text-red-600 text-sm">{formErrors.date}</p>}
            <input
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              className="w-full p-3 border rounded"
            />
            {formErrors.start_time && <p className="text-red-600 text-sm">{formErrors.start_time}</p>}
          </div>

          {/* Services & extras */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-3">Services</h2>
            <label className="flex justify-between items-center p-3 border rounded bg-green-50 mb-3">
              <span>{service.description}</span>
              <strong>৳{service.price}</strong>
            </label>

            <h3 className="font-semibold mb-2">Extras</h3>
            {extras.length > 0 ? (
              <div className="space-y-2">
                {extras.map((extra) => {
                  const selected = formData.selectedServices.some((s) => s.name === extra.name);
                  return (
                    <label
                      key={extra.name}
                      className={`flex justify-between items-center p-2 border rounded cursor-pointer ${
                        selected ? "border-green-700 bg-green-50" : "border-gray-200"
                      }`}
                    >
                      <span>{extra.name}</span>
                      <span className="font-semibold">৳{extra.price}</span>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() =>
                          setFormData((prev) => {
                            const exists = prev.selectedServices.some((e) => e.name === extra.name);
                            const updated = exists
                              ? prev.selectedServices.filter((e) => e.name !== extra.name)
                              : [...prev.selectedServices, extra];
                            return { ...prev, selectedServices: updated };
                          })
                        }
                        className="hidden"
                      />
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">No extras available.</p>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-3">Additional Notes</h2>
            <textarea
              rows="4"
              placeholder="Any notes for the vendor? (+৳500)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-3 border rounded"
            />
          </div>
        </div>

        {/* Right: Summary & Pay */}
        <aside className="w-96 bg-white p-6 rounded-lg shadow sticky top-6 h-fit">
          <h2 className="text-xl font-bold mb-3">Summary</h2>

          <p><strong>{service.name}</strong></p>
          <p className="text-sm text-gray-600 mb-4">{service.description}</p>

          <div className="text-sm space-y-1">
            <p><strong>Name:</strong> {formData.name}</p>
            <p><strong>Address:</strong> {formData.address}, {formData.area}</p>
            <p><strong>Contact:</strong> {formData.contact_number}</p>
            <p><strong>Date:</strong> {formData.date?.toLocaleDateString()}</p>
            <p><strong>Time:</strong> {formData.start_time}</p>
          </div>

          <div className="mt-4 space-y-2">
            <h3 className="font-semibold">Included</h3>
            <p>{service.description} — ৳{service.price}</p>
            {formData.selectedServices.map((s) => (
              <p key={s.name} className="text-sm">
                {s.name} — ৳{s.price}
              </p>
            ))}
            {formData.notes && <p className="text-sm">Notes Charge — ৳500</p>}
          </div>

          <p className="mt-4 text-lg font-bold text-green-700">Total: ৳{selectedTotal}</p>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-4 px-4 py-3 rounded bg-green-700 text-white font-semibold"
          >
            {loading ? "Processing..." : "Pay Now"}
          </button>
        </aside>
      </div>
    </div>
  );
};

export default BookingPage;
