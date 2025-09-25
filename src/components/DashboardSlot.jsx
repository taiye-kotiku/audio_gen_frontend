import React, { useState, useEffect } from "react";
import { getCurrentUser, saveCurrentUser } from "../utils/store.js";

function DashboardSlot({ slotId, apiBaseUrl, savedVoiceId, onVoiceIdChange }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [voiceId, setVoiceId] = useState(
    savedVoiceId || getCurrentUser()?.voice_id || ""
  );
  const [customId, setCustomId] = useState(`slot${slotId}_${Date.now()}`);
  const [progress, setProgress] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const currentUser = getCurrentUser();

  // Persist voiceId
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
    <div className="p-6 border rounded-xl shadow-lg bg-white flex flex-col gap-4 hover:shadow-xl transition">
      <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
        🎛️ Dashboard Slot {slotId}
      </h2>

      {/* Text Input */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-600">Text Input</label>
        <textarea
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
          rows={5}
          placeholder="Enter your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      {/* File Upload */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-600">Upload File</label>
        <input
          type="file"
          accept=".txt"
          onChange={(e) => setFile(e.target.files[0])}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 
                     file:px-4 file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100 cursor-pointer"
        />
      </div>

      {/* Voice ID */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-600">Voice ID</label>
        <input
          type="text"
          className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          placeholder="Enter Voice ID"
          value={voiceId}
          onChange={(e) => setVoiceId(e.target.value)}
        />
      </div>

      {/* Custom ID (optional, can be hidden if not needed) */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-600">Custom ID</label>
        <input
          type="text"
          className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          value={customId}
          onChange={(e) => setCustomId(e.target.value)}
        />
      </div>

      {/* Action Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium
                   hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isGenerating ? "⏳ Generating..." : "Generate Audio"}
      </button>

      {/* Progress Bar */}
      {progress && (
        <div className="space-y-1">
          <p className="text-sm text-gray-600">
            {progress.done}/{progress.total} chunks ({progress.percent}%)
          </p>
          <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Audio Player */}
      {audioUrl && (
        <div className="mt-2">
          <audio controls src={audioUrl} className="w-full rounded-lg" />
        </div>
      )}
    </div>
  );
}

export default DashboardSlot;
