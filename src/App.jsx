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

  const API_BASE_URL = "https://audio-gen-backend-o6nr.onrender.com";

  useEffect(() => {
    setUser(getCurrentUser());
    setLoading(false);
  }, []);

// === Heartbeat (track sessions per token) ===
useEffect(() => {
  if (!user?.email) return;

  // 🔑 persist token per browser/tab
  let sessionToken = localStorage.getItem("session_token");
  if (!sessionToken) {
    sessionToken = crypto.randomUUID();
    localStorage.setItem("session_token", sessionToken);
  }

  const sendHeartbeat = () => {
    fetch(`${API_BASE_URL}/heartbeat/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        email: user.email,
        token: sessionToken, // ✅ stable per tab
      }),
    }).catch(console.error);
  };

  sendHeartbeat(); // first ping
  const interval = setInterval(sendHeartbeat, 30000); // every 30s
  return () => clearInterval(interval);
}, [user]);


  // === Poll active users count (Admin Only) ===
  useEffect(() => {
    // CRITICAL: Only poll the sensitive /admin/active-users/ endpoint if the user is an admin.
    if (!user?.access_token || !user.is_admin) {
      return; 
    }

    const fetchActiveUsers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/active-users/`, {
          headers: { Authorization: `Bearer ${user.access_token}` },
        });
        
        if (res.ok) {
          const data = await res.json();
          setActiveUsers(data.count || 0);
        } else if (res.status === 403 || res.status === 401) {
          // If the admin token fails, stop polling and reset count
          console.warn("Admin authorization failed during poll. Stopping fetch.");
          setActiveUsers(0);
          // Return an object that signals the interval needs to be stopped
          return { shouldStopPolling: true }; 
        }
      } catch (err) {
        console.error("Failed to fetch active users:", err);
      }
    };

    let pollingInterval;

    const startPolling = () => {
        // Run once immediately
        fetchActiveUsers().then(result => {
            if (result && result.shouldStopPolling) {
                return; // Don't start interval if initial fetch failed auth
            }
            // Start the interval if the initial fetch was successful or irrelevant
            pollingInterval = setInterval(fetchActiveUsers, 10000); // every 10s
        });
    }

    startPolling();
    
    // Cleanup function to clear the interval when the component unmounts or user changes
    return () => {
        if (pollingInterval) clearInterval(pollingInterval);
    }
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