import { useEffect, useState } from "react";
import api from "../../api";

function AdminDashboard() {
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);

  useEffect(() => {
    // Fetch leads from API
        const fetchLeads = async () => {
      try {
        const response = await api.get("leads/"); // Adjust API endpoint
        setTotalLeads(response.data.length); // Count number of leads
      } catch (error) {
        console.error("Error fetching leads:", error);
      }
    };

    fetchLeads();

  }, []);

  useEffect(() => {
    // Fetch customers from API
    const fetchCustomers = async () => {
      try {
        const response = await api.get("customers/"); // Adjust API endpoint
        setTotalCustomers(response.data.length); // Count number of customers
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchCustomers(); 

  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ padding: "20px", display: "flex", gap: "20px" }}>
        <div
          style={{
            background: "#4CAF50",
            color: "#fff",
            padding: "20px",
            borderRadius: "10px",
            minWidth: "150px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        >
          <h2>Total Leads</h2>
          <p style={{ fontSize: "2rem", margin: 0 }}>{totalLeads}</p>
        </div>
      </div>

      <div style={{ padding: "20px", display: "flex", gap: "20px" }}>
        <div
          style={{
            background: "#2196F3",
            color: "#fff",
            padding: "20px",
            borderRadius: "10px",
            minWidth: "150px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        >
          <h2>Total Customers</h2>
          <p style={{ fontSize: "2rem", margin: 0 }}>{totalCustomers}</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;


