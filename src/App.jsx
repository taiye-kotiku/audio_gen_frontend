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
}, [user, API_BASE_URL]); // Added API_BASE_URL to dependencies


// === Poll active users count (Admin Only) - FORCE RE-RUN ===
useEffect(() => {
    console.log("🔄 Polling effect triggered. User:", user);
    
    if (!user || !user.access_token || user.is_admin !== true) {
      console.log("❌ Stopping poll - User is not admin or no token");
      setActiveUsers(0); 
      return; 
    }

    console.log("✅ User is admin, starting polling...");

    const fetchActiveUsers = async () => {
      try {
        console.log("📡 Sending request to /admin/active-users/ at:", new Date().toISOString());
        const res = await fetch(`${API_BASE_URL}/admin/active-users/`, {
          headers: { Authorization: `Bearer ${user.access_token}` },
        });
        
        console.log("📥 Response status:", res.status);
        
        if (res.ok) {
          const data = await res.json();
          console.log("✅ Active users count:", data.count);
          setActiveUsers(data.count || 0);
        } else {
          console.error(`❌ Failed: Status ${res.status}`);
          setActiveUsers(0);
        }
      } catch (err) {
        console.error("🌐 Network error:", err);
        setActiveUsers(0);
      }
    };

    fetchActiveUsers();
    const pollingInterval = setInterval(fetchActiveUsers, 10000);
    
    return () => {
      console.log("🧹 Cleaning up interval");
      clearInterval(pollingInterval);
    };
}, [JSON.stringify(user)]); // ✅ Force re-run when user object changes

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


