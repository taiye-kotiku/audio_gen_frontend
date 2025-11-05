import React, { useState, useEffect } from "react";
import DashboardSlot from "../components/DashboardSlot";
import "./Dashboard.css";

function Dashboard() {
  const apiBaseUrl = "https://audio-gen-backend-o6nr.onrender.com";
  const [savedVoiceId, setSavedVoiceId] = useState(
    localStorage.getItem("voiceId") || ""
  );
  const [voiceIdHistory, setVoiceIdHistory] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render of slots

  // Load Voice ID history from localStorage
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("voiceIdHistory") || "[]");
    setVoiceIdHistory(history.slice(0, 3)); // Only keep last 3
  }, []);

  const handleVoiceIdChange = (id) => {
    localStorage.setItem("voiceId", id);
    setSavedVoiceId(id);

    // Update history
    let history = JSON.parse(localStorage.getItem("voiceIdHistory") || "[]");
    
    // Remove duplicate if exists
    history = history.filter(item => item.id !== id);
    
    // Add to beginning with timestamp
    history.unshift({
      id: id,
      timestamp: new Date().toLocaleString(),
    });

    // Keep only last 3
    history = history.slice(0, 3);
    
    localStorage.setItem("voiceIdHistory", JSON.stringify(history));
    setVoiceIdHistory(history);
  };

  const useHistoryVoiceId = (voiceId) => {
    // Update saved Voice ID
    localStorage.setItem("voiceId", voiceId);
    setSavedVoiceId(voiceId);
    
    // Force all slots to re-render with new Voice ID
    setRefreshKey(prev => prev + 1);
    
    // Show confirmation
    alert(`Voice ID "${voiceId}" applied to all slots!`);
  };

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <h1>🎤 Audio Generation Dashboard</h1>
        <p>Enter your text or upload a file, choose a voice, and generate audio.</p>
      </header>

      {/* Voice ID History Table */}
      {voiceIdHistory.length > 0 && (
        <div className="voice-history-card">
          <h3>📋 Recent Voice IDs (Last 3)</h3>
          <table className="voice-history-table">
            <thead>
              <tr>
                <th>Voice ID</th>
                <th>Last Used</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {voiceIdHistory.map((item, index) => (
                <tr key={index}>
                  <td className="voice-id-cell">{item.id}</td>
                  <td className="timestamp-cell">{item.timestamp}</td>
                  <td>
                    <button
                      className="use-btn"
                      onClick={() => useHistoryVoiceId(item.id)}
                      title="Apply this Voice ID to all 3 slots"
                    >
                      Use
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="voice-history-hint">
            💡 Click "Use" to apply a Voice ID to all 3 generators below
          </p>
        </div>
      )}

      <div className="dashboard-grid">
        {[1, 2, 3].map((slotId) => (
          <DashboardSlot
            key={`${slotId}-${refreshKey}`} // Force re-render when refreshKey changes
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