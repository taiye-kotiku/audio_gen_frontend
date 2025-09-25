// src/pages/History.jsx
import React, { useEffect, useState } from "react";
import { getCurrentUser } from "../utils/store.js";

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
        const resp = await fetch(`${apiBaseUrl}/history/${currentUser.email}`);
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
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          📜 History
        </h1>
        <p className="mt-2 text-gray-600">
          Here are your previously generated audio files.
        </p>
      </div>

      {/* Loading / Error States */}
      {loading && (
        <div className="text-gray-500 text-lg font-medium">Loading...</div>
      )}
      {error && <p className="text-red-500 font-medium">{error}</p>}

      {/* No History */}
      {!loading && !error && history.length === 0 && (
        <p className="text-gray-500 italic">No history available yet.</p>
      )}

      {/* History Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {history.map((item, idx) => (
          <div
            key={idx}
            className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition flex flex-col justify-between"
          >
            {/* Header */}
            <div>
              <h2 className="font-semibold text-lg text-gray-800 truncate">
                🎧 {item.custom_id || `Audio ${idx + 1}`}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Voice: <span className="font-medium">{item.voice_id}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Generated:{" "}
                {item.timestamp
                  ? new Date(item.timestamp).toLocaleString()
                  : "Unknown"}
              </p>
            </div>

            {/* Audio + Download */}
            <div className="mt-4">
              <audio
                controls
                src={`${apiBaseUrl}/outputs/${item.custom_id}.mp3`}
                className="w-full rounded-lg border"
              />
              <a
                href={`${apiBaseUrl}/outputs/${item.custom_id}.mp3`}
                download
                className="mt-3 block bg-blue-600 text-white py-2 px-4 rounded-lg text-center hover:bg-blue-700 transition font-medium"
              >
                ⬇️ Download
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default History;
