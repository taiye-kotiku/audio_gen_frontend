// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import History from "./pages/History";
import { getCurrentUser, clearCurrentUser } from "./utils/store.js";
import Header from "./components/Header"; // New Header component

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    setUser(getCurrentUser());
    setLoading(false);
  }, []);

  // Send heartbeat every 30s so backend tracks presence
  useEffect(() => {
    if (!user?.access_token) return;

    const sendHeartbeat = () => {
      fetch("http://localhost:8000/heartbeat/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.access_token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ email: user.email }),
      }).catch(console.error);
    };

    // Send immediately once on load
    sendHeartbeat();

    const interval = setInterval(sendHeartbeat, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Poll active users count every 10s
  useEffect(() => {
    if (!user?.access_token) return;

    const fetchActiveUsers = async () => {
      try {
        const res = await fetch("http://localhost:8000/admin/active-users/", {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setActiveUsers(data.count || 0);
        }
      } catch (err) {
        console.error("Failed to fetch active users:", err);
      }
    };

    fetchActiveUsers(); // call once immediately
    const interval = setInterval(fetchActiveUsers, 10000);
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
        {/* Top Header with active users badge */}
        <Header user={user} activeUsers={activeUsers} onLogout={handleLogout} />

        {/* Routes */}
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
