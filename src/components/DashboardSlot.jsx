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


  // Update parent voiceId for persistence
  useEffect(() => {
    if (voiceId) {
      onVoiceIdChange(voiceId);
    }
  }, [voiceId]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress({ done: 0, total: 1, percent: 0 });
    setAudioUrl(null);

    const formData = new FormData();
    formData.append("custom_id", customId);
    formData.append("voice_id", voiceId || "6sFKzaJr574YWVu4UuJF");
    if (currentUser?.email) {
        formData.append("email", currentUser.email); // ✅ backend needs this
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

      if (!resp.ok) {
        throw new Error(await resp.text());
      }

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
            const updatedUser = { ...currentUser, voice_id: voiceId };
            saveCurrentUser(updatedUser);
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
    <div className="p-4 border rounded-lg shadow-md bg-white flex flex-col gap-3">
      <h2 className="font-semibold text-lg">Dashboard Slot {slotId}</h2>

      {/* Textbox */}
      <textarea
        className="w-full border rounded p-2"
        rows={6}
        placeholder="Enter your text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {/* File Upload */}
      <input
        type="file"
        accept=".txt"
        onChange={(e) => setFile(e.target.files[0])}
      />

      {/* Voice ID */}
      <input
        type="text"
        className="w-full border rounded p-2"
        placeholder="Voice ID"
        value={voiceId}
        onChange={(e) => setVoiceId(e.target.value)}
      />

      {/* Custom ID */}
      <input
        type="text"
        className="w-full border rounded p-2"
        placeholder="Custom ID"
        value={customId}
        onChange={(e) => setCustomId(e.target.value)}
      />

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isGenerating ? "Generating..." : "Generate"}
      </button>

      {/* Progress */}
      {progress && (
        <div>
          <p>
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
        <audio controls src={audioUrl} className="w-full mt-2" />
      )}
    </div>
  );
}

export default DashboardSlot;
