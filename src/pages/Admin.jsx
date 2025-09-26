import React, { useState, useEffect } from "react";
import { api } from "../utils/api.js";
import { getCurrentUser } from "../utils/store.js";
import "./Admin.css"; // Import the new stylesheet

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

  const fetchUsers = async () => { /* ... (logic from Admin.jsx) */ };
  const handleAddUser = async () => { /* ... (logic from Admin.jsx) */ };
  const handleRemoveUser = async (userEmail) => { /* ... (logic from Admin.jsx) */ };
  const handleSetApiKey = async () => { /* ... (logic from Admin.jsx) */ };

  // Helper for SVG Icons
  const Icon = ({ path }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="16" height="16">
      <path d={path} />
    </svg>
  );

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>
      
      <div className="admin-grid">
        {/* === MANAGE USERS CARD === */}
        <div className="admin-card col-span-2">
          <h2>Manage Users</h2>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <div className="input-group">
              <Icon path="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.585.436 1.591.436 2.176 0l6.6-4.925c.025-.012.05-.023.076-.032V4.5A1.5 1.5 0 0 0 14.5 3h-12Z M1 6.8v4.7A1.5 1.5 0 0 0 2.5 13h12a1.5 1.5 0 0 0 1.5-1.5V6.8L8.882 9.875a.5.5 0 0 1-.564 0L1 6.8Z" />
              <input id="email" type="email" placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-group">
              <Icon path="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
              <input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          
          <div className="toggle-group">
            <label>User Role</label>
            <label className="toggle-switch">
              <input type="checkbox" checked={isAdmin} onChange={() => setIsAdmin(!isAdmin)} />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <button onClick={handleAddUser} className="btn btn-primary">
            <Icon path="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z" />
            Add User
          </button>
          {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
        </div>

        {/* === API CONFIGURATION CARD === */}
        <div className="admin-card">
          <h2>API Configuration</h2>
          <div className="form-group">
            <label htmlFor="api-key">ElevenLabs API Key</label>
            <div className="input-group">
               <Icon path="M3.5 11.5a3.5 3.5 0 1 1 3.163-5H14L15.5 8 14 9.5l-1-1-1 1-1-1-1 1-1-1-1 1H6.663a3.5 3.5 0 0 1-3.163 2zM2.5 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
              <input id="api-key" type="text" placeholder="Enter API Key..." value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
            </div>
          </div>
          <button onClick={handleSetApiKey} className="btn btn-primary">Save Key</button>
        </div>
      </div>

      {/* === EXISTING USERS LIST === */}
      <div className="admin-card">
        <h2>Existing Users</h2>
        <div className="user-list-header">
          <div>Email</div>
          <div>Role</div>
          <div style={{ justifySelf: 'end' }}>Action</div>
        </div>
        {users.map((u) => (
          <div key={u.email} className="user-list-row">
            <div>{u.email}</div>
            <div>
              <span className={`role-badge ${u.is_admin ? 'admin' : 'user'}`}>
                {u.is_admin ? 'Admin' : 'User'}
              </span>
            </div>
            <button onClick={() => handleRemoveUser(u.email)} className="action-btn">
              <Icon path="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.528ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Zm2.522.47a.5.5 0 0 1 .528.528l-.5 8.5a.5.5 0 0 1-.998-.06l.5-8.5a.5.5 0 0 1 .47-.528Z" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}