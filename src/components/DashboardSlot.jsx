// src/components/DashboardSlot.jsx
import React, { useState, useEffect, useRef } from "react";
import { getCurrentUser } from "../utils/store.js";

function DashboardSlot({ slotId, apiBaseUrl, savedVoiceId, onVoiceIdChange }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [voiceId, setVoiceId] = useState(savedVoiceId || getCurrentUser()?.voice_id || "");
  const [customId, setCustomId] = useState(`slot${slotId}_${Date.now()}`);
  const [progress, setProgress] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [status, setStatus] = useState("ready"); // ready | generating | completed | error
  const [isGenerating, setIsGenerating] = useState(false);
  const currentUser = getCurrentUser();
  const pollRef = useRef(null);

  useEffect(() => {
    if (voiceId) onVoiceIdChange(voiceId);
  }, [voiceId]);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setStatus("generating");
    setProgress({ done: 0, total: 1, percent: 0 });
    setAudioUrl(null);

    const formData = new FormData();
    formData.append("custom_id", customId);
    formData.append("voice_id", voiceId || "6sFKzaJr574YWVu4UuJF");
    if (currentUser?.email) formData.append("email", currentUser.email);

    if (text.trim()) {
      const blob = new Blob([text], { type: "text/plain" });
      formData.append("file", blob, "input.txt");
    } else if (file) {
      formData.append("file", file);
    } else {
      alert("Please enter text or upload a file.");
      setIsGenerating(false);
      setStatus("error");
      return;
    }

    try {
      const resp = await fetch(`${apiBaseUrl}/generate-audio/`, {
        method: "POST",
        body: formData,
      });
      if (!resp.ok) throw new Error(await resp.text());

      pollRef.current = setInterval(async () => {
        const r = await fetch(`${apiBaseUrl}/progress/${customId}`);
        if (r.ok) {
          const data = await r.json();
          setProgress(data);
          if (data.done === data.total) {
            clearInterval(pollRef.current);
            setIsGenerating(false);
            setStatus("completed");
            setAudioUrl(`${apiBaseUrl}/outputs/${customId}.mp3`);
          }
        }
      }, 2000);
    } catch (err) {
      console.error(err);
      setIsGenerating(false);
      setStatus("error");
    }
  };

  const statusStyles = {
    ready: "bg-gray-200 text-gray-700",
    generating: "bg-blue-600 text-white animate-pulse",
    completed: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-14 flex items-center px-5">
        <span className="bg-white text-blue-600 font-bold w-7 h-7 flex items-center justify-center rounded-full text-sm mr-3 shadow">
          {slotId}
        </span>
        <h2 className="text-white font-semibold text-lg">Dashboard Slot {slotId}</h2>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col gap-5 flex-grow">
        {/* Text Input */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Text Input</label>
          <textarea
            className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
            rows={4}
            placeholder="Enter your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Upload File</label>
          <div
            className={`border-2 rounded-xl p-5 text-center text-sm cursor-pointer transition ${
              dragOver
                ? "border-blue-600 bg-blue-50"
                : "border-dashed border-gray-300 bg-gray-50"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
          >
            📂 {file ? file.name : "Drag & drop file here or click to upload"}
            <input
              type="file"
              accept=".txt"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
            />
          </div>
        </div>

        {/* Voice ID */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Voice ID</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-xl h-11 px-3 focus:ring-2 focus:ring-blue-600 outline-none"
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
          />
        </div>

        {/* Custom ID */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Custom ID</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-xl h-11 px-3 focus:ring-2 focus:ring-blue-600 outline-none"
            value={customId}
            onChange={(e) => setCustomId(e.target.value)}
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`w-full h-12 rounded-full font-semibold text-white shadow transition ${
            isGenerating
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-95"
          }`}
        >
          {isGenerating ? "⏳ Generating..." : "🚀 Generate Audio"}
        </button>

        {/* Status Badge */}
        <div
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold self-start ${statusStyles[status]}`}
        >
          {status === "ready" && "✅ Ready"}
          {status === "generating" && "⏳ Generating..."}
          {status === "completed" && "🎧 Completed"}
          {status === "error" && "❌ Error"}
        </div>

        {/* Progress Bar */}
        {progress && (
          <div>
            <p className="text-xs text-gray-500 mb-1">
              {progress.done}/{progress.total} chunks ({progress.percent}%)
            </p>
            <div className="w-full bg-gray-200 h-2 rounded">
              <div
                className="bg-blue-600 h-2 rounded transition-all"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        )}

        {/* Audio Player */}
        {audioUrl && (
          <div className="mt-4">
            <audio controls src={audioUrl} className="w-full rounded-lg" />
            <a
              href={audioUrl}
              download
              className="mt-3 block bg-green-500 text-white text-center py-2 px-4 rounded-lg hover:bg-green-600 transition"
            >
              ⬇️ Download
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardSlot;
