import React, { useState, useEffect } from "react";
import { api } from "../utils/api.js";
import { getCurrentUser } from "../utils/store.js";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState("");

  const currentUser = getCurrentUser();
  const token = currentUser?.token;

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/list-users/");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users");
    }
  };

  const handleAddUser = async () => {
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("is_admin", isAdmin);

      await api.post("/admin/add-user/", formData);

      setEmail("");
      setPassword("");
      setIsAdmin(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to add user");
    }
  };

  const handleRemoveUser = async (userEmail) => {
    try {
      const formData = new FormData();
      formData.append("email", userEmail);

      await api.post("/admin/remove-user/", formData);
      fetchUsers();
    } catch (err) {
      console.error(err);
      setError("Failed to remove user");
    }
  };

  const handleSetApiKey = async () => {
    try {
      const formData = new FormData();
      formData.append("api_key", apiKey);

      await api.post("/admin/set-api-key/", formData);
      alert("API key updated successfully");
      setApiKey("");
    } catch (err) {
      console.error(err);
      setError("Failed to update API key");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-semibold mb-6">Admin Panel</h2>

      {/* Add User Section */}
      <div className="mb-6">
        <h4 className="text-lg font-medium mb-2">Add User</h4>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            className="border rounded p-2 flex-1"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="border rounded p-2 flex-1"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={() => setIsAdmin(!isAdmin)}
            />
            Admin
          </label>
          <button
            onClick={handleAddUser}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {/* API Key Section */}
      <div className="mb-6">
        <h4 className="text-lg font-medium mb-2">Set ElevenLabs API Key</h4>
        <div className="flex gap-3">
          <input
            className="border rounded p-2 flex-1"
            placeholder="Enter API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <button
            onClick={handleSetApiKey}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Save
          </button>
        </div>
      </div>

      {/* User List */}
      <div>
        <h4 className="text-lg font-medium mb-2">Existing Users</h4>
        <table className="w-full border border-gray-200 rounded overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.email} className="border-t">
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">
                  {u.is_admin ? (
                    <span className="text-blue-600 font-semibold">Admin</span>
                  ) : (
                    "User"
                  )}
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => handleRemoveUser(u.email)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center py-4 text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
