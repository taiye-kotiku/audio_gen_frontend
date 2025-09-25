// src/components/DashboardSlot.jsx
import React, { useState, useEffect } from "react";
import { getCurrentUser } from "../utils/store.js";

function DashboardSlot({ slotId, apiBaseUrl, savedVoiceId, onVoiceIdChange }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [voiceId, setVoiceId] = useState(savedVoiceId || getCurrentUser()?.voice_id || "");
  const [customId, setCustomId] = useState(`slot${slotId}_${Date.now()}`);
  const [progress, setProgress] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const currentUser = getCurrentUser();

  // Update parent voiceId
  useEffect(() => {
    if (voiceId) onVoiceIdChange(voiceId);
  }, [voiceId]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress({ done: 0, total: 1, percent: 0 });
    setAudioUrl(null);

    const formData = new FormData();
    formData.append("custom_id", customId);
    formData.append("voice_id", voiceId || "6sFKzaJr574YWVu4UuJF");
    if (currentUser?.email) {
      formData.append("email", currentUser.email);
    }

    if (text.trim()) {
      const blob = new Blob([text], { type: "text/plain" });
      formData.append("file", blob, "input.txt");
    } else if (file) {
      formData.append("file", file);
    } else {
      alert("Please enter text or upload a file.");
      setIsGenerating(false);
      return;
    }

    try {
      const resp = await fetch(`${apiBaseUrl}/generate-audio/`, {
        method: "POST",
        body: formData,
      });

      if (!resp.ok) throw new Error(await resp.text());

      // Poll progress
      const poll = setInterval(async () => {
        const r = await fetch(`${apiBaseUrl}/progress/${customId}`);
        if (r.ok) {
          const data = await r.json();
          setProgress(data);
          if (data.done === data.total) {
            clearInterval(poll);
            setIsGenerating(false);
            setAudioUrl(`${apiBaseUrl}/outputs/${customId}.mp3`);
          }
        }
      }, 2000);
    } catch (err) {
      console.error(err);
      alert("Error generating audio");
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 flex flex-col gap-4">
      {/* Title */}
      <h2 className="font-bold text-xl text-gray-800 flex items-center gap-2">
        🎛️ Dashboard Slot {slotId}
      </h2>

      {/* Textbox */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Text Input
        </label>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
          rows={5}
          placeholder="Enter your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Upload File
        </label>
        <input
          type="file"
          accept=".txt"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full border border-gray-300 rounded-lg p-2 cursor-pointer"
        />
      </div>

      {/* Voice ID */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Voice ID
        </label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Voice ID"
          value={voiceId}
          onChange={(e) => setVoiceId(e.target.value)}
        />
      </div>

      {/* Custom ID */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Custom ID
        </label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Custom ID"
          value={customId}
          onChange={(e) => setCustomId(e.target.value)}
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className={`w-full py-3 rounded-lg font-semibold text-white transition ${
          isGenerating
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isGenerating ? "⏳ Generating..." : "🚀 Generate Audio"}
      </button>

      {/* Progress Bar */}
      {progress && (
        <div className="mt-2">
          <p className="text-sm text-gray-600 mb-1">
            {progress.done}/{progress.total} chunks ({progress.percent}%)
          </p>
          <div className="w-full bg-gray-200 h-2 rounded">
            <div
              className="bg-blue-600 h-2 rounded"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Audio Player */}
      {audioUrl && (
        <div className="mt-4">
          <audio controls src={audioUrl} className="w-full" />
          <a
            href={audioUrl}
            download
            className="mt-2 block bg-green-600 text-white text-center py-2 px-4 rounded-lg hover:bg-green-700 transition"
          >
            ⬇️ Download
          </a>
        </div>
      )}
    </div>
  );
}

export default DashboardSlot;
