// src/components/Header.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import "./Header.css";

function Header({ user, activeUsers, onLogout }) {
  return (
    <header className="app-header">
      <h2 className="app-title">AudioGen</h2>
      {user && (
        <nav className="main-nav">
          <div className="nav-links">
            <NavLink to="/dashboard" className="nav-link">
              Dashboard
            </NavLink>
            <NavLink to="/history" className="nav-link">
              History
            </NavLink>
            {user.is_admin && (
              <NavLink to="/admin" className="nav-link">
                Admin
              </NavLink>
            )}
          </div>

          <div className="user-info">
             <div className="active-users-badge">
              <span className="active-dot"></span>
              {activeUsers} Active
            </div>
            <span>{user.email}</span>
            <button onClick={onLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}

export default Header;