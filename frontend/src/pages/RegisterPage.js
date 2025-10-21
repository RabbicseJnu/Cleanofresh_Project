// src/pages/RegisterPage.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const AREA_CHOICES = ["Banasree", "Mirpur", "Badda", "Gulshan"];
const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Services → Skills
const SERVICE_SKILLS = {
  RESIDENTIAL: {
    label: "Residential Cleaning",
    skills: {
      KITCHEN: "Kitchen cleaning",
      LIVING_ROOM: "Living room cleaning",
      BATHROOM: "Bathroom cleaning",
      BEDROOMS: "Bedroom cleaning",
    },
  },
  DEEP: {
    label: "Deep Cleaning",
    skills: {
      CABINETS: "Hand-washing cabinets",
      UPHOLSTERY: "Vacuuming upholstery",
      WOOD: "Polishing wood",
      OVEN: "Oven cleaning",
      FAN_BLADES: "Ceiling fan blade cleaning",
      BASEBOARD: "Baseboard cleaning",
    },
  },
  DRY: {
    label: "Dry Cleaning Services",
    skills: {
      CARPET: "Carpet cleaning",
      CLOTHING: "Clothing dry cleaning",
    },
  },
  FLOOR: {
    label: "Floor Cleaning",
    skills: {
      SWEEP_MOP: "Floor sweeping and mopping",
      HARDWOOD: "Hardwood polishing",
      TILE_GROUT: "Tile grout cleaning",
      FLOOR_WAX: "Floor waxing",
      CEMENT: "Cement sealing",
    },
  },
  OFFICE: {
    label: "Office Cleaning",
    skills: {
      CUBICLE: "Cubicle cleaning",
      RESTROOMS: "Restroom cleaning",
      OFFICE_KITCHEN: "Kitchen cleaning",
      RECEPTION: "Reception area cleaning",
    },
  },
};

// 12h presets
const SHIFT_PRESETS = [
  { label: "Day (08:00–20:00)", start: "08:00" },
  { label: "Night (20:00–08:00)", start: "20:00" },
  { label: "Custom…", start: null }, // will show time input for start
];

function computeEnd12h(startHHMM) {
  // Add 12 hours with wrap
  if (!startHHMM) return "";
  const [h, m] = startHHMM.split(":").map(Number);
  const endH = (h + 12) % 24;
  const hh = String(endH).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  return `${hh}:${mm}`;
}

function RegisterPage() {
  const navigate = useNavigate();

  // Single source of truth for role (never store role in formData)
  const [role, setRole] = useState("Customer");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    profile_picture: null,
    customer: { phone: "", address: "", area: "" },
    vendor: {
      contact_number: "",
      area: "",
      bio: "",
      services: [],
      skills: [],
      // slots: Array<{ day, start_time, end_time, preset?: 'day'|'night'|'custom' }>
      slots: [],
    },
  });

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({}); // {field: message}

  // ======== State helpers ========
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));
  };

  const selectedServiceSkills = useMemo(() => {
    const set = new Set();
    (formData.vendor.services || []).forEach((svc) => {
      const svcObj = SERVICE_SKILLS[svc];
      if (svcObj) {
        Object.keys(svcObj.skills).forEach((sk) => set.add(sk));
      }
    });
    return Array.from(set);
  }, [formData.vendor.services]);

  // If a service is unchecked, drop its skills from selection
  const toggleService = (service, checked) => {
    const current = new Set(formData.vendor.services);
    if (checked) current.add(service);
    else current.delete(service);

    const allowed = new Set(
      Array.from(current).flatMap((s) =>
        Object.keys(SERVICE_SKILLS[s]?.skills || {})
      )
    );
    const newSkills = (formData.vendor.skills || []).filter((sk) =>
      allowed.has(sk)
    );

    handleNestedChange("vendor", "services", Array.from(current));
    handleNestedChange("vendor", "skills", newSkills);
  };

  const toggleSkill = (skill, checked) => {
    const current = new Set(formData.vendor.skills || []);
    if (checked) current.add(skill);
    else current.delete(skill);
    handleNestedChange("vendor", "skills", Array.from(current));
  };

  // ======== Slot helpers (unique-day, 12h) ========
  const usedDays = useMemo(
    () => new Set(formData.vendor.slots.map((s) => s.day).filter(Boolean)),
    [formData.vendor.slots]
  );

  const nextUnusedDay = () => DAYS_OF_WEEK.find((d) => !usedDays.has(d)) || "";

  const addSlot = () => {
    const day = nextUnusedDay();
    if (!day) {
      setError("All 7 days already used. Remove one to add another.");
      return;
    }
    const start = "08:00";
    const end = computeEnd12h(start);
    const newSlot = { day, start_time: start, end_time: end, preset: "day" };
    handleNestedChange("vendor", "slots", [...formData.vendor.slots, newSlot]);
  };

  const removeSlot = (index) => {
    const u = [...formData.vendor.slots];
    u.splice(index, 1);
    handleNestedChange("vendor", "slots", u);
  };

  const updateSlotDay = (index, day) => {
    // disallow duplicate days
    if (usedDays.has(day)) {
      setError(
        `You already selected ${day}. Each slot must be a different day.`
      );
      return;
    }
    const u = [...formData.vendor.slots];
    u[index] = { ...u[index], day };
    handleNestedChange("vendor", "slots", u);
  };

  const updateSlotPreset = (index, presetLabel) => {
    const u = [...formData.vendor.slots];
    if (presetLabel.startsWith("Day")) {
      u[index] = {
        ...u[index],
        preset: "day",
        start_time: "08:00",
        end_time: computeEnd12h("08:00"),
      };
    } else if (presetLabel.startsWith("Night")) {
      u[index] = {
        ...u[index],
        preset: "night",
        start_time: "20:00",
        end_time: computeEnd12h("20:00"),
      };
    } else {
      u[index] = {
        ...u[index],
        preset: "custom",
        start_time: u[index].start_time || "06:00",
        end_time: computeEnd12h(u[index].start_time || "06:00"),
      };
    }
    handleNestedChange("vendor", "slots", u);
  };

  const updateCustomStart = (index, start) => {
    const u = [...formData.vendor.slots];
    u[index] = {
      ...u[index],
      start_time: start,
      end_time: computeEnd12h(start),
      preset: "custom",
    };
    handleNestedChange("vendor", "slots", u);
  };

  // ======== Validation ========
  const validate = () => {
    const errs = {};
    const hardError = (msg) => {
      setError(msg);
      return false;
    };

    // Common fields
    if (!formData.username) errs.username = "Username is required.";
    if (!formData.email) errs.email = "Email is required.";
    if (!formData.password) errs.password = "Password is required.";

    if (role === "Customer") {
      const c = formData.customer || {};
      if (!c.phone) errs["customer.phone"] = "Phone is required.";
      if (!c.area) errs["customer.area"] = "Area is required.";
    }

    if (role === "Vendor") {
      const v = formData.vendor || {};
      if (!v.contact_number)
        errs["vendor.contact_number"] = "Contact number is required.";
      if (!v.area) errs["vendor.area"] = "Area is required.";
      if (!v.services || v.services.length === 0)
        errs["vendor.services"] = "Select at least one service.";
      if (!v.skills || v.skills.length === 0)
        errs["vendor.skills"] = "Select at least one skill.";

      // Slot rules
      const slots = v.slots || [];
      if (slots.length < 5)
        errs["vendor.slots"] = "Add at least 5 slots (one per unique day).";

      // unique days + 12 hours exactly
      const seen = new Set();
      for (const s of slots) {
        if (!s.day) return hardError("Every slot must have a day.");
        if (seen.has(s.day))
          return hardError(
            `Duplicate day "${s.day}". Each slot must be a different day.`
          );
        seen.add(s.day);

        if (!s.start_time)
          return hardError(`Slot on ${s.day} is missing start time.`);
        const expectedEnd = computeEnd12h(s.start_time);
        if (s.end_time !== expectedEnd)
          return hardError(
            `Slot on ${s.day} must be exactly 12 hours. End should be ${expectedEnd}.`
          );
      }
    }

    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setError("Please fix the highlighted fields.");
      return false;
    }
    setError("");
    return true;
  };

  // ======== Submit ========
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (!validate()) return;

    try {
      const payload = new FormData();

      // Top-level simple fields (explicitly list to avoid accidental keys)
      payload.append("username", formData.username);
      payload.append("email", formData.email);
      payload.append("password", formData.password);
      if (formData.first_name)
        payload.append("first_name", formData.first_name);
      if (formData.last_name) payload.append("last_name", formData.last_name);

      if (formData.profile_picture instanceof File) {
        payload.append("profile_picture", formData.profile_picture);
      }

      // ROLE — single source of truth (ONLY append once, and not in formData)
      payload.append("role", role);

      if (role === "Customer") {
        payload.append("customer", JSON.stringify(formData.customer));
      } else if (role === "Vendor") {
        const v = formData.vendor;
        const vendorPayload = {
          contact_number: v.contact_number,
          area: v.area,
          bio: v.bio,
          services_list: v.services, // name matches your backend from your earlier code
          skills: v.skills,
          slots: v.slots.map(({ day, start_time, end_time }) => ({
            day,
            start_time,
            end_time,
          })),
        };
        payload.append("vendor", JSON.stringify(vendorPayload));
      } else if (role === "Admin") {
        // If your backend allows admin self-register, include what it needs
        // Otherwise this will just send the role=Admin and basic fields
      }

      // DEBUG (optional):
      // for (const pair of payload.entries()) console.log(pair[0], pair[1]);

      const res = await api.post("/auth/register/", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Register response:", res.data);

      // Success
      // console.log("Register success:", res.data);
      navigate("/login");
    } catch (err) {
      // console.error("Register failed:", err);
      if (err?.response?.data) {
        setError(
          "Registration failed: " + JSON.stringify(err.response.data, null, 2)
        );
      } else {
        setError("Registration failed. Please try again.");
      }
    }
  };

  // ======== UI ========
  const FieldError = ({ name }) =>
    fieldErrors[name] ? (
      <p className="text-red-500 text-sm mt-1">{fieldErrors[name]}</p>
    ) : null;

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-4 py-12"
      style={{ backgroundColor: "#f3f4f6" }}
    >
      <div className="absolute top-6 left-6">
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg shadow hover:bg-gray-900 transition"
        >
          ← Back to Home
        </button>
      </div>

      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-4xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Register
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 whitespace-pre-wrap">
            {error}
          </div>
        )}

        <div className="flex justify-center gap-4 mb-8">
          {["Customer", "Vendor", "Admin"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRole(r);
                setError("");
                setFieldErrors({});
              }}
              className={`px-6 py-2 rounded-xl shadow-md transition-all transform ${
                role === r
                  ? "bg-[#6F8873] text-white scale-110"
                  : "bg-[#AFC9AF] text-gray-800 hover:bg-[#9AB69A]"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <p className="mb-1 text-sm text-gray-600">Profile Picture</p>
            <input
              type="file"
              name="profile_picture"
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              accept="image/*"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
                required
              />
              <FieldError name="username" />
            </div>
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
                required
              />
              <FieldError name="email" />
            </div>
            <div>
              <input
                type="text"
                name="first_name"
                placeholder="First Name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              />
            </div>
            <div>
              <input
                type="text"
                name="last_name"
                placeholder="Last Name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
                required
              />
              <FieldError name="password" />
            </div>
          </div>

          {role === "Customer" && (
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Phone"
                  value={formData.customer.phone}
                  onChange={(e) =>
                    handleNestedChange("customer", "phone", e.target.value)
                  }
                  className="w-full p-3 border rounded-lg"
                />
                <FieldError name="customer.phone" />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Address"
                  value={formData.customer.address}
                  onChange={(e) =>
                    handleNestedChange("customer", "address", e.target.value)
                  }
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div>
                <select
                  value={formData.customer.area}
                  onChange={(e) =>
                    handleNestedChange("customer", "area", e.target.value)
                  }
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">-- Select Area --</option>
                  {AREA_CHOICES.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
                <FieldError name="customer.area" />
              </div>
            </div>
          )}

          {role === "Vendor" && (
            <div className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder="Contact Number"
                  value={formData.vendor.contact_number}
                  onChange={(e) =>
                    handleNestedChange(
                      "vendor",
                      "contact_number",
                      e.target.value
                    )
                  }
                  className="w-full p-3 border rounded-lg"
                />
                <FieldError name="vendor.contact_number" />
              </div>

              <div>
                <select
                  value={formData.vendor.area}
                  onChange={(e) =>
                    handleNestedChange("vendor", "area", e.target.value)
                  }
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">-- Select Area --</option>
                  {AREA_CHOICES.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
                <FieldError name="vendor.area" />
              </div>

              <div>
                <textarea
                  placeholder="Bio"
                  value={formData.vendor.bio}
                  onChange={(e) =>
                    handleNestedChange("vendor", "bio", e.target.value)
                  }
                  className="w-full p-3 border rounded-lg"
                  rows={3}
                />
              </div>

              <div>
                <p className="mb-2 text-sm text-gray-600">Services</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.keys(SERVICE_SKILLS).map((service) => {
                    const checked = formData.vendor.services.includes(service);
                    return (
                      <label key={service} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            toggleService(service, e.target.checked)
                          }
                        />
                        {SERVICE_SKILLS[service].label}
                      </label>
                    );
                  })}
                </div>
                <FieldError name="vendor.services" />
              </div>

              {selectedServiceSkills.map((skill) => {
                const checked = formData.vendor.skills.includes(skill);
                return (
                  <label key={skill} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => toggleSkill(skill, e.target.checked)}
                    />
                    {Object.values(SERVICE_SKILLS)
                      .flatMap((svc) => Object.entries(svc.skills))
                      .find(([key]) => key === skill)?.[1] || skill}
                  </label>
                );
              })}

              {/* Slots */}
              <div>
                <div className="flex items-center justify-between">
                  <p className="mb-2 text-sm text-gray-600">
                    Available Slots — add at least 5, one per unique day. Each
                    slot is exactly 12 hours.
                  </p>
                  <button
                    type="button"
                    onClick={addSlot}
                    className="bg-[#6F8873] text-white px-3 py-1 rounded-lg hover:bg-[#5C6F5E]"
                  >
                    + Add Slot
                  </button>
                </div>
                <FieldError name="vendor.slots" />

                <div className="space-y-3 mt-2">
                  {formData.vendor.slots.map((slot, i) => {
                    const availableDays = [
                      slot.day, // keep current selected
                      ...DAYS_OF_WEEK.filter((d) => !usedDays.has(d)),
                    ].filter(Boolean);

                    return (
                      <div
                        key={i}
                        className="flex flex-col md:flex-row gap-2 items-start md:items-center border p-3 rounded-lg"
                      >
                        {/* Day */}
                        <select
                          value={slot.day}
                          onChange={(e) => updateSlotDay(i, e.target.value)}
                          className="border rounded-lg p-2 w-full md:w-48"
                        >
                          <option value="">-- Select Day --</option>
                          {availableDays.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>

                        {/* Preset */}
                        <select
                          value={
                            slot.preset === "day"
                              ? SHIFT_PRESETS[0].label
                              : slot.preset === "night"
                              ? SHIFT_PRESETS[1].label
                              : SHIFT_PRESETS[2].label
                          }
                          onChange={(e) => updateSlotPreset(i, e.target.value)}
                          className="border rounded-lg p-2 w-full md:w-56"
                        >
                          {SHIFT_PRESETS.map((p) => (
                            <option key={p.label} value={p.label}>
                              {p.label}
                            </option>
                          ))}
                        </select>

                        {/* Custom start (only when custom) */}
                        {slot.preset === "custom" && (
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">
                              Start
                            </label>
                            <input
                              type="time"
                              value={slot.start_time}
                              onChange={(e) =>
                                updateCustomStart(i, e.target.value)
                              }
                              className="border rounded-lg p-2"
                            />
                          </div>
                        )}

                        {/* End (read-only, auto = start + 12h) */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600">End</label>
                          <input
                            type="time"
                            value={slot.end_time}
                            readOnly
                            className="border rounded-lg p-2 bg-gray-100"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeSlot(i)}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 ml-auto"
                        >
                          Del
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#6F8873] text-white p-3 rounded-lg shadow-md transition duration-300 transform hover:scale-105 hover:bg-[#5C6F5E]"
          >
            Register
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full bg-[#88A890] text-white p-3 rounded-lg shadow-md transition duration-300 hover:bg-[#7A987F]"
          >
            Already have an account? Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
