import React, { useState, useEffect } from "react";
import { api } from "../utils/api.js";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const token = currentUser?.token || currentUser?.access_token;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/list-users/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      setError("Failed to fetch users");
    }
  };

  const handleAddUser = async () => {
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("is_admin", isAdmin);

      await api.post("/admin/add-user/", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEmail("");
      setPassword("");
      setIsAdmin(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to add user");
    }
  };

  const handleRemoveUser = async (userEmail) => {
    try {
      const formData = new FormData();
      formData.append("email", userEmail);

      await api.post("/admin/remove-user/", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetApiKey = async () => {
    try {
      const formData = new FormData();
      formData.append("api_key", apiKey);

      await api.post("/admin/set-api-key/", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("API key updated successfully");
      setApiKey("");
    } catch (err) {
      setError("Failed to update API key");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Panel</h2>

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

      <div style={{ marginBottom: "20px" }}>
        <h4>Set ElevenLabs API Key</h4>
        <input
          placeholder="Enter API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <button onClick={handleSetApiKey}>Save API Key</button>
      </div>

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
