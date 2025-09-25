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
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">📜 History</h1>
      <p className="mb-6 text-gray-600">
        Here are your previously generated audio files.
      </p>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && history.length === 0 && (
        <p className="text-gray-500">No history available yet.</p>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {history.map((item, idx) => (
          <div
            key={idx}
            className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition flex flex-col gap-3"
          >
            <h2 className="font-semibold text-lg text-gray-800">
              🎧 {item.custom_id || `Audio ${idx + 1}`}
            </h2>
            <p className="text-sm text-gray-600">
              Voice: <span className="font-medium">{item.voice_id}</span>
            </p>
            <p className="text-xs text-gray-400">
              Generated: {new Date(item.timestamp).toLocaleString()}
            </p>
            <audio
              controls
              src={`${apiBaseUrl}/outputs/${item.custom_id}.mp3`}
              className="w-full mt-2"
            />
            <a
              href={`${apiBaseUrl}/outputs/${item.custom_id}.mp3`}
              download
              className="bg-blue-600 text-white py-2 px-4 rounded-lg text-center hover:bg-blue-700 transition"
            >
              ⬇️ Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default History;