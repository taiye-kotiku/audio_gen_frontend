import React, { useState } from "react";
import { saveCurrentUser } from "../utils/store.js";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const formData = new FormData();
      formData.append("username", email); // 🔑 FastAPI OAuth2 expects `username`
      formData.append("password", password);

      const res = await fetch(
        "https://audio-gen-backend-o6nr.onrender.com/token",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json(); // ✅ only once

      if (!res.ok) {
        throw new Error(data?.detail || "Login failed");
      }

      const user = {
        email,
        is_admin: data.is_admin || false, // backend must send this
        token: data.access_token, // ✅ now stored correctly
      };

      saveCurrentUser(user);
      onLogin(user);

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", marginTop: "50px" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
