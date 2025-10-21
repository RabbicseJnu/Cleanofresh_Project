import { useEffect, useState } from "react";
import api from "../../api";

function VendorDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [vendorData, setVendorData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [completionPhoto, setCompletionPhoto] = useState(null);
  const [activeTab, setActiveTab] = useState("Not Accepted");

  const STATUS_TABS = [
    "Not Accepted",
    "Pending",
    "In Progress",
    "Completed",
    "Overdue",
  ];

  // Fetch logged-in user
  useEffect(() => {
    api
      .get("/auth/me/")
      .then((res) => setCurrentUser(res.data))
      .catch((err) => console.error("Error fetching current user:", err));
  }, []);

  // Fetch vendor info
  useEffect(() => {
    if (!currentUser?.vendor) return;
    api
      .get(`/vendors/${currentUser.vendor.id}/`)
      .then((res) => setVendorData(res.data))
      .catch((err) =>
        console.error("Error fetching vendor data:", currentUser.vendor.id, err)
      );
  }, [currentUser]);

  // Fetch and filter bookings for this vendor
    const fetchAndFilterBookings = async () => {
      if (!vendorData) return;
      try {
        const res = await api.get("/bookings/");

        const vendorServices = vendorData.services.map((s) =>
          s.trim().toLowerCase()
        );
        const vendorSkills = vendorData.skills.map((s) =>
          s.trim().toLowerCase()
        );

        const filtered = res.data
          .filter((b) => {
            // CASE 1: Not Accepted → full filter
            if (b.status === "Not Accepted") {
              // Skip if already assigned to another vendor
              if (b.vendor && b.vendor.id !== currentUser.vendor.id) {
                return false;
              }

              // Area filter
              if (
                b.customer?.area?.trim().toLowerCase() !==
                vendorData.area.trim().toLowerCase()
              ) {
                return false;
              }

              // Service type filter
              const bookingType =
                b.service?.service_type?.trim().toLowerCase() || "";
              if (!vendorServices.includes(bookingType)) {
                return false;
              }

              // Service subtype filter
              const bookingSubtype =
                b.service?.service_subtype?.trim().toLowerCase() || "";
              if (!vendorSkills.includes(bookingSubtype)) {
                return false;
              }

              // Slot filter
              const bookingDate = new Date(b.start_datetime);
              const dayOfWeek = bookingDate.toLocaleString("en-US", {
                weekday: "long",
                timeZone: "Asia/Dhaka",
              });
              const bookingMinutes =
                bookingDate.getHours() * 60 + bookingDate.getMinutes();

              let slotMatch = false;
              vendorData.slots.forEach((slot) => {
                const [sH, sM] = slot.start_time.split(":").map(Number);
                const [eH, eM] = slot.end_time.split(":").map(Number);
                const slotStart = sH * 60 + sM;
                const slotEnd = eH * 60 + eM;
                if (
                  slot.day.trim() === dayOfWeek.trim() &&
                  bookingMinutes >= slotStart &&
                  bookingMinutes <= slotEnd
                ) {
                  slotMatch = true;
                }
              });

              if (!slotMatch) {
                return false;
              }

              return true;
            }

            // CASE 2: All other statuses → only show if assigned to this vendor
            return b.vendor?.id === currentUser.vendor.id;
          })
          .sort(
            (a, b) => new Date(a.start_datetime) - new Date(b.start_datetime)
          );

        setBookings(filtered);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      }
    };


  useEffect(() => {
    fetchAndFilterBookings();
  }, [vendorData]);

  // Handle status change
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      if (newStatus === "Completed" && !completionPhoto) {
        return alert("Please upload a completion photo first!");
      }

      if (newStatus === "Completed") {
        const formData = new FormData();
        formData.append("completed_photo", completionPhoto);
        formData.append("status", "Completed");
        await api.patch(`/bookings/${bookingId}/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setCompletionPhoto(null);
      } else {
        const payload = { status: newStatus };
        if (newStatus === "Pending") payload.vendor_id = currentUser.vendor.id;
        await api.patch(`/bookings/${bookingId}/`, payload);
      }

      fetchAndFilterBookings();
    } catch (err) {
      console.error("Error updating booking:", err);
    }
  };

  // Group bookings by status
  const groupedBookings = {};
  STATUS_TABS.forEach((status) => {
    groupedBookings[status] = bookings.filter((b) => b.status === status);
  });

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Bookings in My Area</h1>

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

      {/* Bookings */}
      <div>
        {groupedBookings[activeTab]?.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {groupedBookings[activeTab].map((b) => (
              <li
                key={b.id}
                className="py-4 px-4 flex flex-col md:flex-row justify-between bg-white rounded-lg mb-3 shadow-sm"
              >
                <div className="space-y-1 text-gray-800">
                  <p>
                    <span className="font-semibold">Service:</span>{" "}
                    {b.service?.name || "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Type:</span>{" "}
                    {b.service?.service_type || "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Subtype:</span>{" "}
                    {b.service?.service_subtype || "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Customer:</span>{" "}
                    {b.name || "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Contact:</span>{" "}
                    {b.contact_number || "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Address:</span> {b.address}
                  </p>
                  <p>
                    <span className="font-semibold">When:</span>{" "}
                    {new Date(b.start_datetime).toLocaleString()}
                  </p>
                  <p>
                    <span className="font-semibold">Status:</span> {b.status}
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

                {/* Status Actions */}
                <div className="flex flex-col gap-2 mt-2 md:mt-0">
                  {b.status === "Not Accepted" && (
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                      onClick={() => handleStatusChange(b.id, "Pending")}
                    >
                      Accept
                    </button>
                  )}
                  {b.status === "Pending" && (
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                      onClick={() => handleStatusChange(b.id, "In Progress")}
                    >
                      Start
                    </button>
                  )}
                  {b.status === "In Progress" && (
                    <div className="flex flex-col gap-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCompletionPhoto(e.target.files[0])}
                      />
                      <button
                        className="bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600"
                        onClick={() => handleStatusChange(b.id, "Completed")}
                      >
                        Complete
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">
            No {activeTab.toLowerCase()} bookings in your area or matching your
            services/slots.
          </p>
        )}
      </div>
    </div>
  );
}

export default VendorDashboard;
