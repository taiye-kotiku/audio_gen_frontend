import React, { useState } from "react";
import DashboardSlot from "../components/DashboardSlot";
import "./Dashboard.css"; // custom styles for layout

function Dashboard() {
  const apiBaseUrl = "https://audio-gen-backend-o6nr.onrender.com";
  const [savedVoiceId, setSavedVoiceId] = useState(
    localStorage.getItem("voiceId") || ""
  );

  const handleVoiceIdChange = (id) => {
    localStorage.setItem("voiceId", id);
    setSavedVoiceId(id);
  };

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <h1>🎤 Audio Generation Dashboard</h1>
        <p>Enter your text or upload a file, choose a voice, and generate audio.</p>
      </header>

      <div className="dashboard-grid">
        {[1, 2, 3].map((slotId) => (
          <DashboardSlot
            key={slotId}
            slotId={slotId}
            apiBaseUrl={apiBaseUrl}
            savedVoiceId={savedVoiceId}
            onVoiceIdChange={handleVoiceIdChange}
          />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
