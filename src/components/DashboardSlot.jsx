// src/components/DashboardSlot.jsx
import React, { useState, useEffect, useRef } from "react";
import { getCurrentUser } from "../utils/store.js";
import "./DashboardSlot.css"; // Optional: For styles specific to this component, like the file dropzone

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
  }, [voiceId, onVoiceIdChange]);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileClick = () => {
    document.getElementById(`file-input-${slotId}`).click();
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
      // Clean up polling on error
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    }
  };

  const getStatusContent = () => {
    switch (status) {
      case "generating":
        return <><span className="status-icon"></span>Generating...</>;
      case "completed":
        return <>✅ Completed</>;
      case "error":
        return <>❌ Error</>;
      case "ready":
      default:
        return <>✅ Ready</>;
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case 'generating':
        return 'status-generating';
      case 'completed':
        return 'status-completed';
      case 'error':
        return 'status-error';
      default:
        return 'status-ready';
    }
  };

  return (
    <div className="slot-card">
      <div className="slot-header">Dashboard Slot {slotId}</div>
      <div className="slot-body">
        <label>Text Input</label>
        <textarea
          placeholder="Enter your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        
        <div
          className={`file-dropzone ${dragOver ? "drag-over" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleFileDrop}
          onClick={handleFileClick}
        >
          <span>☁️ Drag & drop or click to upload</span>
          <input
            id={`file-input-${slotId}`}
            type="file"
            accept=".txt"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ display: "none" }}
          />
        </div>
        {file && <p className="file-name">Selected: {file.name}</p>}

        <label>Voice ID</label>
        <input
          type="text"
          value={voiceId}
          onChange={(e) => setVoiceId(e.target.value)}
        />

        <label>Custom ID</label>
        <input
          type="text"
          value={customId}
          onChange={(e) => setCustomId(e.target.value)}
        />

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="slot-button"
        >
          {isGenerating ? "Generate..." : "Generate Audio"}
        </button>

        <div className={`status-badge ${getStatusClass()}`}>
          {getStatusContent()}
        </div>

        {progress && isGenerating && (
          <div className="progress-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        )}

        {audioUrl && (
          <div className="audio-result">
            <audio controls src={audioUrl} className="w-full" />
            <a href={audioUrl} download className="download-link">
              Download Audio
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardSlot;