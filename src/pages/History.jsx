// src/pages/History.jsx
import React, { useEffect, useState } from "react";
import { getCurrentUser } from "../utils/store.js";
import "./History.css";

function History() {
  const apiBaseUrl = "https://audio-gen-backend-o6nr.onrender.com";
  const currentUser = getCurrentUser();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser?.email) {
      setError("No user logged in.");
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        // FIX 1: Correct endpoint with email parameter
        const resp = await fetch(`${apiBaseUrl}/user/history/?email=${encodeURIComponent(currentUser.email)}`);
        
        if (!resp.ok) throw new Error(await resp.text());
        const data = await resp.json();
        setHistory(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [currentUser?.email]);

  if (loading) {
    return <div className="history-container"><div className="loading-state">Loading history...</div></div>;
  }

  if (error) {
    return <div className="history-container"><div className="error-state">{error}</div></div>;
  }

  return (
    <div className="history-container">
      <div className="mb-8">
        <h1>📜 Generation History</h1>
        <p>Here are your previously generated audio files.</p>
      </div>

      {history.length === 0 ? (
        <div className="empty-state">No history available yet.</div>
      ) : (
        <div className="history-table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>Custom ID</th>
                <th>Voice ID</th>
                <th>Generated At</th>
                <th>Text Preview</th>
                <th>Playback</th>
                <th>Download</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.custom_id || `Audio ${idx + 1}`}</td>
                  <td>{item.voice_id}</td>
                  <td>
                    {item.timestamp
                      ? new Date(item.timestamp).toLocaleString()
                      : "Unknown"}
                  </td>
                  <td className="text-preview">
                    {item.text_preview || "No preview available"}
                  </td>
                  <td>
                    {/* FIX 2: Use the file_path from history data */}
                    <audio
                      controls
                      src={`${apiBaseUrl}${item.file_path}`}
                    />
                  </td>
                  <td>
                    {/* FIX 3: Use the file_path from history data */}
                    <a
                      href={`${apiBaseUrl}${item.file_path}`}
                      download
                      className="download-btn"
                    >
                      ⬇️
                      <span>Download</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default History;