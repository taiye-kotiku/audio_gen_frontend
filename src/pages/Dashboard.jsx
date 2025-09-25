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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-md py-6 px-8">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          🎤 Audio Generation Dashboard
        </h1>
        <p className="text-indigo-100 mt-1">
          Enter your text or upload a file, choose a voice, and generate audio.
        </p>
      </header>

      {/* Main Content */}
      <main className="p-8">
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
      </main>
    </div>
  );
}

export default Dashboard;
