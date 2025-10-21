import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import {
  User,
  Calendar,
  Edit,
  CheckCircle,
  Clock,
  ListChecks,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./datepicker-theme.css";

const ServiceInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [extras, setExtras] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    area: "",
    contact_number: "", 
    date: null,
    start_time: "",
    notes: "",
    selectedServices: [], // NEW: the sub-sub selected items
    paymentMethod: "Card",
  });

  const steps = [
    { name: "Customer Info", icon: <User size={20} /> },
    { name: "Select Date", icon: <Calendar size={20} /> },
    { name: "Select Time", icon: <Clock size={20} /> },
    { name: "Select Services", icon: <ListChecks size={20} /> },
    { name: "Additional Notes", icon: <Edit size={20} /> },
    { name: "Summary", icon: <CheckCircle size={20} /> },
  ];

  // Fetch main service
  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await api.get(`/services/${id}/`);
        setService(res.data);
      } catch (err) {
        console.error("Error fetching service:", err);
      }
    };
    fetchService();
  }, [id]);

  // Pre-fill customer data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me/");
        const user = res.data;
        setUserRole(user.role);

        const cust = user.customer || {};
        if (!cust.address || !cust.phone || !cust.area)
          setProfileIncomplete(true);

        setFormData((prev) => ({
          ...prev,
          name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
          address: cust.address || "",
          area: cust.area || "",
          contact_number: cust.phone || "",
        }));

        if (cust.id) setCustomerId(cust.id);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  //Fetch Extras

  useEffect(() => {
    const fetchExtras = async () => {
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
  }, [service]);

  const validateStep = (step = currentStep) => {
    const errors = {};
    if (step === 0) {
      if (!formData.name.trim()) errors.name = "Name is required";
      if (!formData.address.trim()) errors.address = "Address is required";
      if (!formData.area.trim()) errors.area = "Area is required";
      if (!formData.contact_number.trim())
        errors.contact_number = "Contact number is required";
    }
    if (step === 1 && !formData.date)
      errors.date = "Please select a valid date";
    if (step === 2 && !formData.start_time)
      errors.start_time = "Please select a start time";

    if (step === 5 && !formData.paymentMethod)
      errors.paymentMethod = "Please select a payment method.";
    return errors;
    
  }

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

  const selectedTotal = useMemo(() => {
    const basePrice = Number(service?.price) || 0;
    const detailsTotal = (formData.selectedServices || []).reduce(
      (sum, s) => sum + (Number(s.price) || 0),
      0
    );
    const notesFee = formData.notes?.trim() ? 500 : 0;

    return basePrice + detailsTotal + notesFee;
  }, [formData.selectedServices, service, formData.notes]);

  const handleSubmit = async () => {
    // 1️⃣ Validate all steps
    const allErrors = {};
    for (let i = 0; i < steps.length; i++)
      Object.assign(allErrors, validateStep(i));
    if (Object.keys(allErrors).length > 0) {
      setFormErrors(allErrors);
      return;
    }

    try {
      // 2️⃣ Ensure customer record exists
      const custId = await ensureCustomerRecord();

      // 3️⃣ Prepare start_datetime
      const startDatetime = new Date(formData.date);
      const [hours, minutes] = formData.start_time.split(":");
      startDatetime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

      // 4️⃣ Prepare booking payload
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

      // 5️⃣ Create booking
      const bookingRes = await api.post("/bookings/", bookingBody);
      const bookingId = bookingRes.data.id;

      // 6️⃣ Handle payment
      if (formData.paymentMethod === "Card") {
        // Initiate SSLCOMMERZ payment
        const paymentRes = await api.post("/payments/initiate/", {
          booking_id: bookingId,
        });

        if (paymentRes.data.payment_url) {
          // Redirect to SSLCOMMERZ
          window.location.href = paymentRes.data.payment_url;
          return; // stop further execution
        } else {
          alert("Failed to initiate payment. Try again.");
          return;
        }
      } else if (formData.paymentMethod === "Bkash") {
        // Optional: you can implement a Bkash payment flow or just show instructions
        alert(
          "Booking created! Please pay via Bkash to confirm your booking.\n" +
            `Booking ID: ${bookingId}`
        );
      }

      // 7️⃣ Reset form (for offline/offsite payment)
      setShowBookingForm(false);
      setFormData({
        name: "",
        address: "",
        area: "",
        contact_number: "",
        date: null,
        start_time: "",
        notes: "",
        selectedServices: [],
        paymentMethod: "Card",
      });
      setCurrentStep(0);
      setFormErrors({});
    } catch (err) {
      console.error(
        "Booking/payment submission error:",
        err?.response?.data || err
      );
      alert(
        "Booking failed: " +
          JSON.stringify(err?.response?.data || err?.message, null, 2)
      );
    }
  };
  


  if (!service) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#99C99C" }}
      >
        <p className="text-white text-xl">Loading service details...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative flex flex-col"
      style={{ backgroundColor: "#99C99C" }}
    >
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 px-5 py-2 rounded-lg text-white shadow"
        style={{ backgroundColor: "#4A7C59" }}
      >
        Back to Services
      </button>

<div className="flex-grow bg-gray-50 py-12 px-6">
  <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12">
    {/* Left - Product Image */}
{service.image && (
  <div className="bg-white rounded-2xl shadow-lg p-6 flex justify-center items-center hover:scale-105 transition-transform duration-300">
    <img
      src={
        service.image.startsWith("http")
          ? service.image
          : `${process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000"}${service.image}`
      }
      alt={service.name}
      className="rounded-lg object-contain max-h-[550px] w-full"
    />
  </div>
    )}

    {/* Right - Product Info */}
    <div className="flex flex-col space-y-6">
      {/* Title & Price */}
      <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col space-y-4">
        <h1 className="text-4xl font-extrabold text-gray-900">{service.name}</h1>
        {service.price != null && (
          <p className="text-3xl text-green-700 font-bold">${service.price}</p>
        )}
        {/* Optional: Ratings */}
        <div className="flex items-center space-x-2 text-yellow-500">
          <span>⭐⭐⭐⭐☆</span>
          <span className="text-gray-500">(120 reviews)</span>
        </div>
        {/* Stock Info */}
        <p className="text-gray-700 font-semibold">
          {service.available !== false ? "In Stock" : "Out of Stock"}
        </p>
      </div>

      {/* Description */}
      {service.description && (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Product Details</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            {service.description.split(". ").map((line, idx) => (
              <li key={idx}>{line}.</li>
            ))}
          </ul>
        </div>
      )}

      {/* Service Type / Subtype */}
      <div className="bg-white p-6 rounded-2xl shadow-lg grid grid-cols-1 sm:grid-cols-2 gap-4">
        {service.service_type && (
          <div>
            <h3 className="text-gray-700 font-semibold mb-1">Service Type</h3>
            <p className="text-gray-600">{service.service_type}</p>
          </div>
        )}
        {service.service_subtype && (
          <div>
            <h3 className="text-gray-700 font-semibold mb-1">Subtype</h3>
            <p className="text-gray-600">{service.service_subtype}</p>
          </div>
        )}
      </div>

      {/* Extras / Bullet Points */}
      {extras.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Extra Services</h2>
          <ul className="divide-y divide-gray-200">
            {extras.map((extra, idx) => (
              <li key={idx} className="py-3 flex justify-between">
                <span className="text-gray-700">{extra.name}</span>
                <span className="font-semibold text-gray-900">৳{extra.price ?? 0}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Amazon-style “Book Now” */}
      {userRole === "Customer" && (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
<button
  onClick={() =>
    navigate("/booking", {
      state: {
        service,
        extras,
        initialFormData: formData,
        customerId, // optional, useful if ServiceInfo already created customer
      },
    })
  }
  className="w-full py-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-lg shadow-md transition duration-300"
>
  Book Now
</button>

        </div>
      )}
    </div>
  </div>
</div>


    </div>
  );
};

export default ServiceInfo;
