// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import History from "./pages/History";
import { getCurrentUser, clearCurrentUser } from "./utils/store.js";
import Header from "./components/Header";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState(0);

  // 👇 use deployed backend by default
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "https://audio-gen-backend-o6nr.onrender.com";

  useEffect(() => {
    setUser(getCurrentUser());
    setLoading(false);
  }, []);

  // === Heartbeat ===
  useEffect(() => {
    if (!user?.email) return;

    const sendHeartbeat = () => {
      fetch(`${API_BASE_URL}/heartbeat/`, {
        method: "POST",
        headers: {
          ...(user?.access_token ? { Authorization: `Bearer ${user.access_token}` } : {}),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ email: user.email }),
      }).catch(console.error);
    };

    sendHeartbeat(); // first ping
    const interval = setInterval(sendHeartbeat, 30000); // every 30s
    return () => clearInterval(interval);
  }, [user]);

  // === Active Users Poll ===
  useEffect(() => {
    if (!user?.access_token) return;

    const fetchActiveUsers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/active-users/`, {
          headers: { Authorization: `Bearer ${user.access_token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setActiveUsers(data.count || 0);
        }
      } catch (err) {
        console.error("Failed to fetch active users:", err);
      }
    };

    fetchActiveUsers(); // once at mount
    const interval = setInterval(fetchActiveUsers, 10000); // every 10s
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    clearCurrentUser();
    setUser(null);
  };

  const ProtectedRoute = ({ children, adminOnly = false }) => {
    if (!user) return <Navigate to="/login" replace />;
    if (adminOnly && !user.is_admin) return <Navigate to="/dashboard" replace />;
    return children;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <div>
        <Header user={user} activeUsers={activeUsers} onLogout={handleLogout} />

        <Routes>
          <Route
            path="/login"
            element={!user ? <Login onLogin={setUser} /> : <Navigate to="/dashboard" replace />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </div>
    </Router>
  );
}
