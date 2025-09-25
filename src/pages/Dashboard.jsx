// src/pages/Dashboard.jsx
import React, { useState } from "react";
import DashboardSlot from "../components/DashboardSlot";

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
    <div className="p-6 grid md:grid-cols-3 gap-6">
      <DashboardSlot
        slotId={1}
        apiBaseUrl={apiBaseUrl}
        savedVoiceId={savedVoiceId}
        onVoiceIdChange={handleVoiceIdChange}
      />
      <DashboardSlot
        slotId={2}
        apiBaseUrl={apiBaseUrl}
        savedVoiceId={savedVoiceId}
        onVoiceIdChange={handleVoiceIdChange}
      />
      <DashboardSlot
        slotId={3}
        apiBaseUrl={apiBaseUrl}
        savedVoiceId={savedVoiceId}
        onVoiceIdChange={handleVoiceIdChange}
      />
    </div>
  );
}

export default Dashboard;
