// src/pages/Admin.jsx
import React, { useState, useEffect } from "react";
import { api } from "../utils/api.js";
import { getCurrentUser } from "../utils/store.js"; // ✅ use helper

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState("");

  const currentUser = getCurrentUser(); // ✅ consistent
  const token = currentUser?.token;

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/list_users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users");
    }
  };

  const handleAddUser = async () => {
    try {
      await api.post("/admin/add_user", {
        email,
        password,
        is_admin: isAdmin,
      });

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
      await api.post("/admin/remove_user", { email: userEmail });
      fetchUsers();
    } catch (err) {
      console.error(err);
      setError("Failed to remove user");
    }
  };

  const handleSetApiKey = async () => {
    try {
      await api.post("/admin/set_api_key", { api_key: apiKey });
      alert("API key updated successfully");
      setApiKey("");
    } catch (err) {
      console.error(err);
      setError("Failed to update API key");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Panel</h2>

      {/* Add User Section */}
      <div style={{ marginBottom: "20px" }}>
        <h4>Add User</h4>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={() => setIsAdmin(!isAdmin)}
          />{" "}
          Admin
        </label>
        <button onClick={handleAddUser}>Add User</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      {/* API Key Section */}
      <div style={{ marginBottom: "20px" }}>
        <h4>Set ElevenLabs API Key</h4>
        <input
          placeholder="Enter API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <button onClick={handleSetApiKey}>Save API Key</button>
      </div>

      {/* User List */}
      <div>
        <h4>Existing Users</h4>
        <ul>
          {users.map((u) => (
            <li key={u.email}>
              {u.email} {u.is_admin ? "(Admin)" : ""}
              <button
                onClick={() => handleRemoveUser(u.email)}
                style={{ marginLeft: "10px" }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
