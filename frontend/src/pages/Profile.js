// frontend/src/pages/Profile.js
import React, { useEffect, useState } from "react";
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

// ======================
// Service + Skills Mapping
// ======================
const SERVICE_OPTIONS = {
  RESIDENTIAL: {
    label: "Residential Cleaning",
    skills: {
      BEDROOMS: "Bedroom cleaning",
      KITCHEN: "Kitchen cleaning",
      BATHROOM: "Bathroom cleaning",
      LIVING_ROOM: "Living room cleaning",
    },
  },
  DEEP_CLEANING: {
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
  DRY_CLEANING: {
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
      CUBICLES: "Cubicle cleaning",
      RESTROOMS: "Restroom cleaning",
      OFFICE_KITCHEN: "Kitchen cleaning",
      RECEPTION: "Reception area cleaning",
    },
  },
};

function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  // Fetch current user + services
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await api.get("auth/me/");
        setUser(res.data);
        setFormData(res.data);
      } catch (err) {
        console.error("Failed to fetch profile or services:", err.response?.data || err);
      }
    };
    fetchAll();
  }, []);

  // Prepare editable formData when user toggles editing
  useEffect(() => {
    if (!editing || !user) return;

    const newData = { ...user };

    if (user.role === "Vendor" && user.vendor) {
      newData.vendor = {
        ...user.vendor,
        services: user.vendor.services || [],
        skills: user.vendor.skills || [],
        slots: user.vendor.slots?.map((s) => ({ ...s })) || [],
      };
    }

    if (user.role === "Customer" && user.customer) {
      newData.customer = {
        ...user.customer,
        phone: user.customer.phone || "",
        address: user.customer.address || "",
        area: user.customer.area || "",
      };
    }

    setFormData(newData);
  }, [editing, user]);

  // Basic input change handler (top-level fields and file inputs)
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  // For nested objects like vendor / customer
  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));
  };

  const removeSlot = async (index) => {
    const slot = formData.vendor?.slots?.[index];
    if (!slot) return;

    if (slot.id) {
      try {
        await api.delete(`vendor-slots/${slot.id}/`);
      } catch (err) {
        console.error("Failed to delete slot:", err.response?.data || err);
      }
    }

    const updated = [...formData.vendor.slots];
    updated.splice(index, 1);
    handleNestedChange("vendor", "slots", updated);
  };

  const addSlot = () => {
    const u = [...(formData.vendor?.slots || [])];
    u.push({ day: "", start_time: "", end_time: "" });
    handleNestedChange("vendor", "slots", u);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const userPayload = new FormData();
      ["username", "email", "first_name", "last_name", "password"].forEach((f) => {
        if (formData[f]) userPayload.append(f, formData[f]);
      });
      if (formData.profile_picture instanceof File) {
        userPayload.append("profile_picture", formData.profile_picture);
      }
      await api.put(`users/${user.id}/`, userPayload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (user.role === "Customer" && formData.customer) {
        const customerPayload = {
          phone: formData.customer.phone || "",
          address: formData.customer.address || "",
          area: formData.customer.area || "",
          user: user.id,
        };

        if (formData.customer.id) {
          await api.put(`customers/${formData.customer.id}/`, customerPayload);
        } else {
          const cRes = await api.post("customers/", customerPayload);
          setFormData((prev) => ({
            ...prev,
            customer: { ...customerPayload, id: cRes.data.id },
          }));
        }
      }

      if (user.role === "Vendor" && formData.vendor) {
        let vendorId = formData.vendor.id || null;
        const vendorPayload = {
          contact_number: formData.vendor.contact_number || "",
          area: formData.vendor.area || "",
          bio: formData.vendor.bio || "",
          user: user.id,
          // include services and skills
          services: formData.vendor.services || [],
          skills: formData.vendor.skills || [],
        };

        let vendorRes;
        if (vendorId) {
          vendorRes = await api.put(`vendors/${vendorId}/`, vendorPayload);
        } else {
          vendorRes = await api.post("vendors/", vendorPayload);
          vendorId = vendorRes.data.id;
          setFormData((prev) => ({
            ...prev,
            vendor: { ...prev.vendor, id: vendorId },
          }));
        }

        if (vendorId && formData.vendor.slots?.length >= 0) {
          const slotsCopy = [...(formData.vendor.slots || [])];
          for (let i = 0; i < slotsCopy.length; i++) {
            const slot = slotsCopy[i];
            const payload = {
              day: slot.day || "",
              start_time: slot.start_time || "",
              end_time: slot.end_time || "",
              vendor: vendorId,
            };

            try {
              if (slot.id) {
                await api.put(`vendor-slots/${slot.id}/`, payload);
              } else {
                const newSlotRes = await api.post("vendor-slots/", payload);
                slotsCopy[i].id = newSlotRes.data.id;
              }
            } catch (err) {
              console.error("Slot save failed:", err.response?.data || err);
            }
          }
          handleNestedChange("vendor", "slots", slotsCopy);
        }
      }

      const refreshed = await api.get("auth/me/");
      setUser(refreshed.data);
      setFormData(refreshed.data);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Save failed:", err.response?.data || err);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // If user couldn’t be loaded (shouldn’t happen with ProtectedRoute), show a small guard
  if (!user) return <p style={{ padding: 24 }}>Loading profile…</p>;

  const avatar = user.profile_picture?.startsWith?.("http")
    ? user.profile_picture
    : user.profile_picture
    ? `${process.env.REACT_APP_API_URL}${user.profile_picture}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user.username
      )}&background=6F8873&color=fff&size=128`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-[#d9e6da] to-white p-8">
      <img
        src={avatar}
        alt={user.username}
        className="w-32 h-32 rounded-full shadow-lg mb-6 ring-4 ring-[#6F8873]"
      />

      {editing && (
        <input
          type="file"
          name="profile_picture"
          onChange={handleChange}
          className="mb-4"
        />
      )}

      <h1 className="text-3xl font-bold text-gray-800 mb-2 transition-transform hover:scale-105">
        {editing ? (
          <input
            type="text"
            name="username"
            value={formData.username || ""}
            onChange={handleChange}
            className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-[#6F8873]"
          />
        ) : (
          user.username
        )}
      </h1>
      <p className="text-gray-600 text-lg mb-6">{user.role}</p>

      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-lg transition hover:shadow-xl">
        {/* User Info */}
        {["email", "first_name", "last_name"].map((f) => (
          <div key={f} className="mb-4">
            <p className="text-sm text-gray-500 capitalize">{f}</p>
            {editing ? (
              <input
                type={f === "email" ? "email" : "text"}
                name={f}
                value={formData[f] || ""}
                onChange={handleChange}
                className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-[#6F8873]"
              />
            ) : (
              <p className="text-gray-800">{user[f]}</p>
            )}
          </div>
        ))}

        {editing && (
          <div className="mb-4">
            <p className="text-sm text-gray-500">Password</p>
            <input
              type="password"
              name="password"
              placeholder="New password"
              onChange={handleChange}
              className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-[#6F8873]"
            />
          </div>
        )}

        {/* CUSTOMER */}
        {user.role === "Customer" && (
          <>
            {["phone", "address", "area"].map((f) => (
              <div key={f} className="mb-4">
                <p className="text-sm text-gray-500 capitalize">{f}</p>
                {editing ? (
                  f === "area" ? (
                    <select
                      value={formData.customer?.area || ""}
                      onChange={(e) => handleNestedChange("customer", f, e.target.value)}
                      className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-[#6F8873]"
                    >
                      <option value="">-- Select Area --</option>
                      {AREA_CHOICES.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.customer?.[f] || ""}
                      onChange={(e) => handleNestedChange("customer", f, e.target.value)}
                      className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-[#6F8873]"
                    />
                  )
                ) : (
                  <p className="text-gray-800">{user.customer?.[f]}</p>
                )}
              </div>
            ))}
          </>
        )}

        {/* VENDOR */}
        {user.role === "Vendor" && (
          <>
            {["contact_number", "area"].map((f) => (
              <div key={f} className="mb-4">
                <p className="text-sm text-gray-500 capitalize">{f}</p>
                {editing ? (
                  f === "area" ? (
                    <select
                      value={formData.vendor?.area || ""}
                      onChange={(e) => handleNestedChange("vendor", f, e.target.value)}
                      className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-[#6F8873]"
                    >
                      <option value="">-- Select Area --</option>
                      {AREA_CHOICES.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.vendor?.[f] || ""}
                      onChange={(e) => handleNestedChange("vendor", f, e.target.value)}
                      className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-[#6F8873]"
                    />
                  )
                ) : (
                  <p className="text-gray-800">{user.vendor?.[f]}</p>
                )}
              </div>
            ))}

            {/* Bio */}
            <div className="mb-4">
              <p className="text-sm text-gray-500">Bio</p>
              {editing ? (
                <textarea
                  value={formData.vendor?.bio || ""}
                  onChange={(e) => handleNestedChange("vendor", "bio", e.target.value)}
                  className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-[#6F8873]"
                  rows={3}
                  placeholder="Write a short bio about yourself"
                />
              ) : (
                <p className="text-gray-800">{user.vendor?.bio}</p>
              )}
            </div>

            {/* Services */}
            <div className="mb-4">
              <p className="text-sm text-gray-500">Services Offered</p>
              {editing ? (
                <div className="space-y-1">
                  {Object.entries(SERVICE_OPTIONS).map(([serviceCode, { label }]) => (
                    <label key={serviceCode} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.vendor?.services?.includes(serviceCode) || false}
                        onChange={(e) => {
                          let updated = [...(formData.vendor?.services || [])];
                          if (e.target.checked) updated.push(serviceCode);
                          else updated = updated.filter((s) => s !== serviceCode);
                          handleNestedChange("vendor", "services", updated);
                        }}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              ) : (
                <ul className="list-disc ml-6 text-gray-800">
                  {user.vendor?.services?.map((s) => (
                    <li key={s}>{SERVICE_OPTIONS[s]?.label || s}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Skills */}
            <div className="mb-4">
              <p className="text-sm text-gray-500">Skills</p>
              {editing ? (
                (formData.vendor?.services || []).flatMap((svc) => {
                  const service = SERVICE_OPTIONS[svc];
                  if (!service?.skills) return [];
                  return Object.entries(service.skills).map(([skillCode, skillLabel]) => (
                    <label key={skillCode} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.vendor?.skills?.includes(skillCode) || false}
                        onChange={(e) => {
                          let updated = [...(formData.vendor?.skills || [])];
                          if (e.target.checked) updated.push(skillCode);
                          else updated = updated.filter((s) => s !== skillCode);
                          handleNestedChange("vendor", "skills", updated);
                        }}
                      />
                      {skillLabel}
                    </label>
                  ));
                })
              ) : (
                <ul className="list-disc ml-6 text-gray-800">
                  {user.vendor?.skills?.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Slots */}
            <div className="mb-4">
              <p className="text-sm text-gray-500">Slots</p>
              {editing ? (
                <div className="space-y-2">
                  {(formData.vendor?.slots || []).map((slot, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <select
                        value={slot.day || ""}
                        onChange={(e) => {
                          const u = [...formData.vendor.slots];
                          u[i].day = e.target.value;
                          handleNestedChange("vendor", "slots", u);
                        }}
                        className="border rounded-lg p-2 w-32 focus:ring-2 focus:ring-[#6F8873]"
                      >
                        <option value="">-- Select Day --</option>
                        {DAYS_OF_WEEK.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>

                      <input
                        type="time"
                        value={slot.start_time || ""}
                        onChange={(e) => {
                          const u = [...formData.vendor.slots];
                          u[i].start_time = e.target.value;
                          handleNestedChange("vendor", "slots", u);
                        }}
                        className="border rounded-lg p-2 w-24 focus:ring-2 focus:ring-[#6F8873]"
                      />

                      <input
                        type="time"
                        value={slot.end_time || ""}
                        onChange={(e) => {
                          const u = [...formData.vendor.slots];
                          u[i].end_time = e.target.value;
                          handleNestedChange("vendor", "slots", u);
                        }}
                        className="border rounded-lg p-2 w-24 focus:ring-2 focus:ring-[#6F8873]"
                      />

                      <button
                        onClick={() => removeSlot(i)}
                        className="bg-red-500 text-white px-2 rounded-lg hover:bg-red-600 transition"
                      >
                        Del
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={addSlot}
                    className="bg-[#6F8873] text-white px-3 py-1 rounded-lg hover:bg-[#5C6F5E] transition"
                  >
                    Add Slot
                  </button>
                </div>
              ) : (
                <ul className="list-disc ml-6 text-gray-800">
                  {user.vendor?.slots?.map((s, i) => (
                    <li key={i}>
                      {s.day}: {s.start_time}-{s.end_time}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 mt-6">
        {editing ? (
          <>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#6F8873] disabled:opacity-60 text-white px-6 py-2 rounded-lg shadow-md hover:bg-[#5C6F5E] transition"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="bg-[#88A890] text-white px-6 py-2 rounded-lg shadow-md hover:bg-[#7A987F] transition"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="bg-[#6F8873] text-white px-6 py-2 rounded-lg shadow-md hover:bg-[#5C6F5E] transition"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}

export default Profile;
