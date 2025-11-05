import React, { useState, useEffect } from "react";
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import History from "./pages/History";
import { getCurrentUser, clearCurrentUser } from "./utils/store.js";
import Header from "./components/Header";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState(0);

  const API_BASE_URL = "https://audio-gen-backend-o6nr.onrender.com";

  useEffect(() => {
    setUser(getCurrentUser());
    setLoading(false);
  }, []);

  // === IMPROVED Heartbeat (fixed for bookmarks) ===
  useEffect(() => {
    if (!user?.email) return;

    let sessionToken = localStorage.getItem("session_token");
    if (!sessionToken) {
      sessionToken = crypto.randomUUID();
      localStorage.setItem("session_token", sessionToken);
      console.log("✅ New session token created:", sessionToken.substring(0, 8) + "...");
    } else {
      console.log("✅ Using existing session token:", sessionToken.substring(0, 8) + "...");
    }

    const sendHeartbeat = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/heartbeat/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            email: user.email,
            token: sessionToken,
          }),
        });
        
        if (response.ok) {
          console.log("💓 Heartbeat sent successfully");
        } else {
          console.error("❌ Heartbeat failed:", response.status);
        }
      } catch (error) {
        console.error("❌ Heartbeat error:", error);
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 30000);
    return () => clearInterval(interval);
  }, [user, API_BASE_URL]);

  // === Poll active users count (Admin Only) ===
  useEffect(() => {
    if (!user || !user.token || user.is_admin !== true) {
      setActiveUsers(0); 
      return; 
    }

    const fetchActiveUsers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/active-users/`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        
        if (res.ok) {
          const data = await res.json();
          setActiveUsers(data.count || 0);
        } else {
          setActiveUsers(0);
        }
      } catch (err) {
        setActiveUsers(0);
      }
    };

    fetchActiveUsers();
    const pollingInterval = setInterval(fetchActiveUsers, 10000);
    return () => clearInterval(pollingInterval);
  }, [user?.token, user?.is_admin, API_BASE_URL]);

  const handleLogout = () => {
    localStorage.removeItem("session_token");
    clearCurrentUser();
    setUser(null);
    window.location.href = "/login";
  };

  // Layout component with Header
  const Layout = () => (
    <div>
      <Header user={user} activeUsers={activeUsers} onLogout={handleLogout} />
      <Outlet />
    </div>
  );

  // Protected route wrapper
  const ProtectedRoute = ({ children, adminOnly = false }) => {
    if (!user) return <Navigate to="/login" replace />;
    if (adminOnly && !user.is_admin) return <Navigate to="/dashboard" replace />;
    return children;
  };

  // Create router with v7 syntax
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "login",
          element: !user ? <Login onLogin={setUser} /> : <Navigate to="/dashboard" replace />,
        },
        {
          path: "dashboard",
          element: (
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          ),
        },
        {
          path: "history",
          element: (
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          ),
        },
        {
          path: "admin",
          element: (
            <ProtectedRoute adminOnly={true}>
              <Admin />
            </ProtectedRoute>
          ),
        },
        {
          path: "*",
          element: <Navigate to={user ? "/dashboard" : "/login"} replace />,
        },
      ],
    },
  ]);

  if (loading) return <div>Loading...</div>;

  return <RouterProvider router={router} />;
}

export default App;