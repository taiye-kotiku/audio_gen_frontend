// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import History from "./pages/History";
import { getCurrentUser, clearCurrentUser } from "./utils/store.js";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    setUser(getCurrentUser());
    setLoading(false);
  }, []);

  // Send heartbeat every 60s so backend tracks presence
  useEffect(() => {
    if (!user?.email) return;
    const interval = setInterval(() => {
      fetch("http://localhost:8000/heartbeat/", {
        method: "POST",
        body: new URLSearchParams({ email: user.email }),
      }).catch(console.error);
    }, 60000);
    return () => clearInterval(interval);
  }, [user]);

  // Poll active users count every 10s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://localhost:8000/admin/active-users/");
        const data = await res.json();
        setActiveUsers(data.count || 0);
      } catch (err) {
        console.error("Failed to fetch active users:", err);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

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
        {/* Top Navigation */}
        <header
          style={{
            padding: "10px 20px",
            background: "#222",
            color: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0 }}>Audio Generator App</h2>
          {user && (
            <nav style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              {/* Active Users Count */}
              <span
                style={{
                  background: "green",
                  padding: "5px 10px",
                  borderRadius: "20px",
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                }}
              >
                🟢 {activeUsers} Active
              </span>

              <span>{user.email}</span>
              <Link to="/dashboard" style={{ color: "#fff", textDecoration: "none" }}>
                Dashboard
              </Link>
              <Link to="/history" style={{ color: "#fff", textDecoration: "none" }}>
                History
              </Link>
              {user.is_admin && (
                <Link to="/admin" style={{ color: "#fff", textDecoration: "none" }}>
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                style={{
                  background: "red",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  padding: "5px 10px",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </nav>
          )}
        </header>

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
          <Route
            path="*"
            element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
          />
        </Routes>
      </div>
    </Router>
  );
}
