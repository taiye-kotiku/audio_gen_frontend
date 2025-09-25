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
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        🎤 Audio Generation Dashboard
      </h1>
      <p className="mb-8 text-gray-600">
        Enter your text or upload a file, choose a voice, and generate audio.
      </p>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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
