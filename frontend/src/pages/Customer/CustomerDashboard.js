import { useEffect, useState } from "react";
import api from "../../api";

function CustomerDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [serviceBookings, setServiceBookings] = useState([]);
  const [productOrders, setProductOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("Service Bookings");
  const [statusTab, setStatusTab] = useState("Not Accepted");
  const [requestForm, setRequestForm] = useState({
    show: null,
    type: "", // "service" or "product"
    id: null,
    amount: "",
    reason: "Customer requested",
    customReason: "",
  });

  const STATUS_TABS = [
    "Not Accepted",
    "Pending",
    "In Progress",
    "Completed",
    "Overdue",
    "Refunded",
    "Refunded But Pending",
    "Refunded But Rejected",
  ];

  const refundReasons = [
    "Customer requested",
    "Service issue",
    "Overcharge",
    "Other",
  ];

  // Fetch logged-in user
  useEffect(() => {
    api
      .get("/auth/me/")
      .then((res) => setCurrentUser(res.data))
      .catch(console.error);
  }, []);

  // Fetch service bookings
  useEffect(() => {
    if (!currentUser?.id) return;
    api
      .get("/bookings/")
      .then((res) => {
        const customerBookings = res.data
          .filter((b) => b.customer?.user === currentUser.id)
          .sort(
            (a, b) => new Date(a.start_datetime) - new Date(b.start_datetime)
          );
        setServiceBookings(customerBookings);
      })
      .catch(console.error);
  }, [currentUser]);

  // Fetch product orders
  useEffect(() => {
    if (!currentUser?.id) return;
    api
      .get("/orders/")
      .then((res) => {
        const customerOrders = res.data
          .filter((o) => o.customer?.id === currentUser.customer.id)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setProductOrders(customerOrders);
      })
      .catch(console.error);
  }, [currentUser]);

  // Open refund/request form
  const openRequestForm = (item, type) => {
    if (!["Not Accepted", "Overdue"].includes(item.status)) return;
    setRequestForm({
      show: item.id,
      type,
      id: item.id,
      amount: item.total_price || "",
      reason: refundReasons[0],
      customReason: "",
    });
  };

  const handleRequestChange = (e) => {
    const { name, value } = e.target;
    if (name === "amount") {
      const item =
        requestForm.type === "service"
          ? serviceBookings.find((b) => b.id === requestForm.id)
          : productOrders.find((o) => o.id === requestForm.id);
      if (Number(value) > item.total_price) return;
    }
    setRequestForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!requestForm.id) return;

    const finalReason =
      requestForm.reason === "Other"
        ? requestForm.customReason
        : requestForm.reason;

    try {
      await api.post("/refunds/", {
        booking_id: requestForm.type === "service" ? requestForm.id : null,
        order_id: requestForm.type === "product" ? requestForm.id : null,
        amount: requestForm.amount,
        reason: finalReason,
        status: "Pending",
      });

      // Update locally
      if (requestForm.type === "service") {
        setServiceBookings((prev) =>
          prev.map((b) =>
            b.id === requestForm.id ? { ...b, status: "Pending" } : b
          )
        );
      } else {
        setProductOrders((prev) =>
          prev.map((o) =>
            o.id === requestForm.id ? { ...o, status: "Pending" } : o
          )
        );
      }

      setRequestForm({
        show: null,
        type: "",
        id: null,
        amount: "",
        reason: "Customer requested",
        customReason: "",
      });

      alert("Request submitted successfully!");
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Error submitting request.");
    }
  };

  // Group bookings/orders by status
  const groupByStatus = (items) => {
    const grouped = {};
    STATUS_TABS.forEach((status) => {
      grouped[status] = items.filter((i) => i.status === status);
    });
    return grouped;
  };

  const groupedServiceBookings = groupByStatus(serviceBookings);

  // Select which data to show based on tab
  const activeData =
    activeTab === "Service Bookings"
      ? groupedServiceBookings
      : { All: productOrders };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">My {activeTab}</h1>

      {/* Switch between Service Bookings / Product Orders */}
      <div className="flex space-x-2 mb-4">
        {["Service Bookings", "Product Orders"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setStatusTab("Not Accepted");
            }}
            className={`px-4 py-2 rounded-lg font-semibold ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Status Tabs (only show for services) */}
      {activeTab === "Service Bookings" && (
        <div className="flex space-x-2 mb-6 flex-wrap">
          {STATUS_TABS.map((status) => (
            <button
              key={status}
              onClick={() => setStatusTab(status)}
              className={`px-4 py-2 rounded-lg font-semibold ${
                statusTab === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {status} ({groupedServiceBookings[status]?.length || 0})
            </button>
          ))}
        </div>
      )}

      {/* List */}
      <div>
        {activeTab === "Service Bookings" ? (
          activeData[statusTab]?.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {activeData[statusTab].map((item) => (
                <li
                  key={item.id}
                  className="py-4 px-4 flex flex-col md:flex-row justify-between bg-white rounded-lg mb-3 shadow-sm"
                >
                  {/* Info */}
                  <div className="space-y-1 text-gray-800">
                    <p>
                      <span className="font-semibold">Name:</span>{" "}
                      {item.service?.name || "-"}
                    </p>
                    <p>
                      <span className="font-semibold">Type:</span>{" "}
                      {item.service?.service_type || "-"}
                    </p>
                    <p>
                      <span className="font-semibold">Quantity:</span>{" "}
                      {item.quantity || 1}
                    </p>
                    <p>
                      <span className="font-semibold">Price:</span> BDT{" "}
                      {item.total_price}
                    </p>
                    {item.payment_method && (
                      <p>
                        <span className="font-semibold">Payment Method:</span>{" "}
                        {item.payment_method}
                      </p>
                    )}
                    {item.address && (
                      <p>
                        <span className="font-semibold">Address:</span>{" "}
                        {item.address}
                      </p>
                    )}
                    {item.vendor && (
                      <p>
                        <span className="font-semibold">Vendor:</span>{" "}
                        {item.vendor.username}
                      </p>
                    )}
                    {item.start_datetime && (
                      <p>
                        <span className="font-semibold">Scheduled:</span>{" "}
                        {new Date(item.start_datetime).toLocaleString()}
                      </p>
                    )}
                    <p>
                      <span className="font-semibold">Status:</span>{" "}
                      {item.status}
                    </p>
                  </div>

                  {/* Request Refund */}
                  {requestForm.show === item.id ? (
                    <form
                      onSubmit={handleRequestSubmit}
                      className="flex flex-col gap-2 mt-2 md:mt-0 p-3 bg-gray-50 rounded-lg shadow w-full md:w-1/3"
                    >
                      <input
                        type="number"
                        name="amount"
                        max={item.total_price}
                        value={requestForm.amount}
                        onChange={handleRequestChange}
                        className="border p-2 rounded"
                        required
                      />
                      <select
                        name="reason"
                        value={requestForm.reason}
                        onChange={handleRequestChange}
                        className="border p-2 rounded"
                        required
                      >
                        {refundReasons.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      {requestForm.reason === "Other" && (
                        <input
                          type="text"
                          name="customReason"
                          placeholder="Enter reason"
                          value={requestForm.customReason}
                          onChange={handleRequestChange}
                          className="border p-2 rounded"
                          required
                        />
                      )}
                      <button
                        type="submit"
                        className="bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700"
                      >
                        Submit Request
                      </button>
                    </form>
                  ) : (
                    ["Not Accepted", "Overdue"].includes(item.status) && (
                      <button
                        onClick={() => openRequestForm(item, "service")}
                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 mt-2 md:mt-0"
                      >
                        Request Refund
                      </button>
                    )
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">
              No {statusTab.toLowerCase()} service bookings.
            </p>
          )
        ) : productOrders.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {productOrders.map((item) => (
              <li
                key={item.id}
                className="py-4 px-4 flex flex-col md:flex-row justify-between bg-white rounded-lg mb-3 shadow-sm"
              >
                {/* Info */}
                <div>
                  {item.items.map((orderItem) => (
                    <div key={orderItem.id} className="mb-2">
                      <p>
                        <span className="font-semibold">Name:</span>{" "}
                        {orderItem.product?.name || "-"}
                      </p>
                      <p>
                        <span className="font-semibold">Quantity:</span>{" "}
                        {orderItem.quantity}
                      </p>
                      <p>
                        <span className="font-semibold">Price:</span> BDT{" "}
                        {orderItem.price}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Request Refund */}
                {requestForm.show === item.id ? (
                  <form
                    onSubmit={handleRequestSubmit}
                    className="flex flex-col gap-2 mt-2 md:mt-0 p-3 bg-gray-50 rounded-lg shadow w-full md:w-1/3"
                  >
                    <input
                      type="number"
                      name="amount"
                      max={item.total_price}
                      value={requestForm.amount}
                      onChange={handleRequestChange}
                      className="border p-2 rounded"
                      required
                    />
                    <select
                      name="reason"
                      value={requestForm.reason}
                      onChange={handleRequestChange}
                      className="border p-2 rounded"
                      required
                    >
                      {refundReasons.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    {requestForm.reason === "Other" && (
                      <input
                        type="text"
                        name="customReason"
                        placeholder="Enter reason"
                        value={requestForm.customReason}
                        onChange={handleRequestChange}
                        className="border p-2 rounded"
                        required
                      />
                    )}
                    <button
                      type="submit"
                      className="bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700"
                    >
                      Submit Request
                    </button>
                  </form>
                ) : (
                  ["Not Accepted", "Overdue"].includes(item.status) && (
                    <button
                      onClick={() => openRequestForm(item, "product")}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 mt-2 md:mt-0"
                    >
                      Request Refund
                    </button>
                  )
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No product orders.</p>
        )}
      </div>
    </div>
  );
}

export default CustomerDashboard;
