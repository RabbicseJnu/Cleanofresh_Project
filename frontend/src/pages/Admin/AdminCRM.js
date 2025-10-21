import React, { useState, useEffect } from "react";
import api from "../../api";

function AdminCRM() {
  const [leadData, setLeadData] = useState({
    name: "",
    email: "",
    phone: "",
    lead_score: 0,
    source: "",
    status: "Pending",
  });

  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [searchLeadId, setSearchLeadId] = useState("");
  const [searchCustomerId, setSearchCustomerId] = useState("");
  const [stats, setStats] = useState({
    newToday: 0,
    byStatus: [],
    topSources: [],
  });

  const fetchLeads = () => {
    api
      .get("leads/")
      .then((res) => setLeads(res.data))
      .catch(console.error);
  };

  const fetchCustomers = () => {
    api
      .get("customers/")
      .then((res) => setCustomers(res.data))
      .catch(console.error);
  };

  const fetchStats = () => {
    Promise.all([
      api.get("leads/stats/today/"),
      api.get("leads/stats/by-status/"),
      api.get("leads/stats/top-sources/"),
    ])
      .then(([todayRes, statusRes, sourcesRes]) => {
        setStats({
          newToday: todayRes.data.new_leads_today,
          byStatus: statusRes.data,
          topSources: sourcesRes.data,
        });
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchLeads();
    fetchStats();
    fetchCustomers();
  }, []);

  const handleLeadChange = (e) =>
    setLeadData({ ...leadData, [e.target.name]: e.target.value });
  const handleCustomerChange = (e) =>
    setCustomerData({ ...customerData, [e.target.name]: e.target.value });
  const handleCustomerEditChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const resetForm = () => {
    setLeadData({
      name: "",
      email: "",
      phone: "",
      lead_score: 0,
      source: "",
      status: "Pending",
    });
    setEditingId(null);
    fetchLeads();
    fetchStats();
    fetchCustomers();
  };

  const resetCustomerForm = () => {
    setCustomerData({ name: "", email: "", phone: "" });
    setEditingCustomer(null);
    fetchCustomers();
  };

  const handleLeadSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      api
        .put(`leads/${editingId}/`, leadData)
        .then(() => {
          alert("Lead updated successfully!");
          resetForm();
        })
        .catch(console.error);
    } else {
      api
        .post("leads/", leadData)
        .then(() => {
          alert("Lead created successfully!");
          resetForm();
        })
        .catch(console.error);
    }
  };

  const handleCustomerSubmit = (e) => {
    e.preventDefault();
    api
      .post("customers/", customerData)
      .then(() => {
        alert("Customer created successfully!");
        resetCustomerForm();
      })
      .catch(console.error);
  };

  const handleLeadEdit = (lead) => {
    setLeadData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      lead_score: lead.lead_score,
      source: lead.source,
      status: lead.status,
    });
    setEditingId(lead.id);
  };

  const handleCustomerEdit = (customer) => {
    setEditingCustomer(customer.id);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    });
  };

  const handleLeadDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      api
        .delete(`leads/${id}/`)
        .then(() => resetForm())
        .catch(console.error);
    }
  };

  const handleCustomerDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      api
        .delete(`customers/${id}/`)
        .then(() => {
          setCustomers(customers.filter((c) => c.id !== id));
        })
        .catch(console.error);
    }
  };

  const handleConvert = (id) => {
    if (window.confirm("Convert this lead to a customer?")) {
      api
        .post(`leads/${id}/convert/`)
        .then(() => {
          alert("Lead converted to customer!");
          resetForm();
        })
        .catch(console.error);
    }
  };

  const handleCustomerUpdate = (e) => {
    e.preventDefault();
    api
      .put(`customers/${editingCustomer}/`, formData)
      .then(() => {
        setCustomers(
          customers.map((c) =>
            c.id === editingCustomer ? { ...c, ...formData } : c
          )
        );
        setEditingCustomer(null);
      })
      .catch(console.error);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        CRM Dashboard (Leads & Customers)
      </h1>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-200 p-4 rounded shadow">
          <h2 className="font-semibold mb-2">New Leads Today</h2>
          <p className="text-xl">{stats.newToday}</p>
        </div>
        <div className="bg-yellow-200 p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Leads by Status</h2>
          <ul>
            {stats.byStatus.map((s) => (
              <li key={s.status}>
                {s.status}: {s.total}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-green-200 p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Top Sources (7 days)</h2>
          <ul>
            {stats.topSources.map((s, i) => (
              <li key={i}>
                {s.source}: {s.total}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Forms side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Lead Form */}
        <div>
          <h2 className="text-xl font-semibold mb-2">
            {editingId ? "Edit Lead" : "Create New Lead"}
          </h2>
          <form onSubmit={handleLeadSubmit} className="space-y-3">
            <input
              type="text"
              name="name"
              value={leadData.name}
              placeholder="Name"
              onChange={handleLeadChange}
              className="border p-2 w-full rounded"
              required
            />
            <input
              type="email"
              name="email"
              value={leadData.email}
              placeholder="Email"
              onChange={handleLeadChange}
              className="border p-2 w-full rounded"
              required
            />
            <input
              type="text"
              name="phone"
              value={leadData.phone}
              placeholder="Phone"
              onChange={handleLeadChange}
              className="border p-2 w-full rounded"
              required
            />
            <input
              type="number"
              name="lead_score"
              value={leadData.lead_score}
              placeholder="Lead Score"
              onChange={handleLeadChange}
              className="border p-2 w-full rounded"
            />
            <input
              type="text"
              name="source"
              value={leadData.source}
              placeholder="Source"
              onChange={handleLeadChange}
              className="border p-2 w-full rounded"
            />
            <select
              name="status"
              value={leadData.status}
              onChange={handleLeadChange}
              className="border p-2 w-full rounded"
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              {editingId ? "Update Lead" : "Add Lead"}
            </button>
          </form>
        </div>

        {/* Customer Form */}
        <div>
          <h2 className="text-xl font-semibold mb-2">
            {editingCustomer ? "Edit Customer" : "Create New Customer"}
          </h2>
          <form
            onSubmit={
              editingCustomer ? handleCustomerUpdate : handleCustomerSubmit
            }
            className="space-y-3"
          >
            <input
              type="text"
              name="name"
              value={editingCustomer ? formData.name : customerData.name}
              placeholder="Name"
              onChange={
                editingCustomer
                  ? handleCustomerEditChange
                  : handleCustomerChange
              } 
              className="border p-2 w-full rounded"
              required
            />
            <input
              type="email"
              name="email"
              value={editingCustomer ? formData.email : customerData.email}
              placeholder="Email"
              onChange={
                editingCustomer
                  ? handleCustomerEditChange
                  : handleCustomerChange
              }
              className="border p-2 w-full rounded"
              required
            />
            <input
              type="text"
              name="phone"
              value={editingCustomer ? formData.phone : customerData.phone}
              placeholder="Phone"
              onChange={
                editingCustomer
                  ? handleCustomerEditChange
                  : handleCustomerChange
              }
              className="border p-2 w-full rounded"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {editingCustomer ? "Update Customer" : "Add Customer"}
            </button>
          </form>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Leads</h2>

        <div className="flex space-x-2 mb-4">
          <input
            type="number"
            placeholder="Search Lead by ID"
            value={searchLeadId}
            onChange={(e) => setSearchLeadId(e.target.value)}
            className="border p-2 rounded w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">ID</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Phone</th>
                <th className="border p-2">Score</th>
                <th className="border p-2">Source</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const filteredLeads = searchLeadId
                  ? leads.filter((lead) => lead.id === parseInt(searchLeadId))
                  : leads;

                if (filteredLeads.length === 0) {
                  return (
                    <tr>
                      <td className="border p-2 text-center" colSpan="8">
                        No results found
                      </td>
                    </tr>
                  );
                }

                return filteredLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td className="border p-2">{lead.id}</td>
                    <td className="border p-2">{lead.name}</td>
                    <td className="border p-2">{lead.email}</td>
                    <td className="border p-2">{lead.phone}</td>
                    <td className="border p-2">{lead.lead_score}</td>
                    <td className="border p-2">{lead.source}</td>
                    <td className="border p-2">{lead.status}</td>
                    <td className="border p-2 flex space-x-2">
                      <button
                        onClick={() => handleLeadEdit(lead)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded"
                        disabled={lead.status === "Converted"}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleLeadDelete(lead.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                        disabled={lead.status === "Converted"}
                      >
                        Delete
                      </button>
                      {lead.status !== "Converted" && (
                        <button
                          onClick={() => handleConvert(lead.id)}
                          className="bg-blue-500 text-white px-2 py-1 rounded"
                        >
                          Convert
                        </button>
                      )}
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Customers</h2>

        <div className="flex space-x-2 mb-4">
          <input
            type="number"
            placeholder="Search Customer by ID"
            value={searchCustomerId}
            onChange={(e) => setSearchCustomerId(e.target.value)}
            className="border p-2 rounded w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">ID</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Phone</th>
                <th className="border p-2">Joined At</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const filteredCustomers = searchCustomerId
                  ? customers.filter((c) => c.id === parseInt(searchCustomerId))
                  : customers;

                if (filteredCustomers.length === 0) {
                  return (
                    <tr>
                      <td className="border   p-2 text-center" colSpan="6">
                        No results found
                      </td>
                    </tr>
                  );
                }

                return filteredCustomers.map((c) => (
                  <tr key={c.id}>
                    <td className="border p-2">{c.id}</td>
                    <td className="border p-2">{c.name}</td>
                    <td className="border p-2">{c.email}</td>
                    <td className="border p-2">{c.phone}</td>
                    <td className="border p-2">
                      {new Date(c.joined_at).toLocaleDateString()}
                    </td>
                    <td className="border p-2 flex space-x-2">
                      <button
                        onClick={() => handleCustomerEdit(c)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleCustomerDelete(c.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminCRM;
