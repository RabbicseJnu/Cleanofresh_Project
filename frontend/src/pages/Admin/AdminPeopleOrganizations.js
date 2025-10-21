import React, { useEffect, useState } from "react";
import api from "../../api";

function AdminPeopleOrganizations() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("users/");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.username}?`)) return;
    try {
      await api.delete(`users/${user.id}/`);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const renderUserTable = (role, headerColor) => {
    const filtered = users.filter((u) => u.role === role);
    if (!filtered.length)
      return <p className="text-gray-500">No {role}s found.</p>;

    return (
      <div className="overflow-x-auto rounded-lg shadow mb-8">
        <table className="w-full border border-gray-300">
          <thead className={`${headerColor} text-white`}>
            <tr>
              <th className="border px-3 py-2">ID</th>
              <th className="border px-3 py-2">Username</th>
              <th className="border px-3 py-2">Email</th>
              <th className="border px-3 py-2">Name</th>
              <th className="border px-3 py-2">Role</th>
              <th className="border px-3 py-2">Profile</th>
              {role === "Customer" && (
                <>
                  <th className="border px-3 py-2">Phone</th>
                  <th className="border px-3 py-2">Address</th>
                  <th className="border px-3 py-2">Area</th>
                </>
              )}
              {role === "Vendor" && (
                <>
                  <th className="border px-3 py-2">Contact</th>
                  <th className="border px-3 py-2">Email</th>
                  <th className="border px-3 py-2">Area</th>
                  <th className="border px-3 py-2">Bio</th>
                </>
              )}
              <th className="border px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="text-center bg-white">
                <td className="border px-3 py-2">{u.id}</td>
                <td className="border px-3 py-2 truncate">{u.username}</td>
                <td className="border px-3 py-2 truncate">{u.email}</td>
                <td className="border px-3 py-2">
                  {u.first_name} {u.last_name}
                </td>
                <td className="border px-3 py-2">{u.role}</td>
                <td className="border px-3 py-2">
                  {u.profile_picture ? (
                    <img
                      src={u.profile_picture}
                      alt={u.username}
                      className="w-12 h-12 rounded-full mx-auto"
                    />
                  ) : (
                    "—"
                  )}
                </td>

                {role === "Customer" && (
                  <>
                    <td className="border px-3 py-2">
                      {u.customer?.phone || "—"}
                    </td>
                    <td className="border px-3 py-2 whitespace-normal break-words max-w-xs">
                      {u.customer?.address || "—"}
                    </td>
                    <td className="border px-3 py-2">
                      {u.customer?.area || "—"}
                    </td>
                  </>
                )}

                {role === "Vendor" && (
                  <>
                    <td className="border px-3 py-2">
                      {u.vendor?.contact_number || "—"}
                    </td>
                    <td className="border px-3 py-2">
                      {u.vendor?.email || "—"}
                    </td>
                    <td className="border px-3 py-2">
                      {u.vendor?.area || "—"}
                    </td>
                    <td className="border px-3 py-2 whitespace-normal break-words max-w-xs">
                      {u.vendor?.bio || "—"}
                    </td>
                  </>
                )}

                <td className="border px-3 py-2">
                  <button
                    onClick={() => handleDelete(u)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) return <p className="p-6 text-gray-500">Loading users...</p>;

  return (
    <div className="p-6 w-full overflow-x-auto">
      <h1 className="text-2xl font-bold mb-4 text-green-800">
        Admin - People & Organizations
      </h1>
      <h2 className="text-xl font-semibold mt-6 mb-2 text-green-700">Admins</h2>
      {renderUserTable("Admin", "bg-[#556B2F]")} {/* dark olive */}
      <h2 className="text-xl font-semibold mt-6 mb-2 text-green-700">
        Customers
      </h2>
      {renderUserTable("Customer", "bg-[#6B8E23]")} {/* medium olive */}
      <h2 className="text-xl font-semibold mt-6 mb-2 text-green-700">
        Vendors
      </h2>
      {renderUserTable("Vendor", "bg-[#808000]")} {/* lighter olive */}
    </div>
  );
}

export default AdminPeopleOrganizations;
