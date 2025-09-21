import React, { useState } from "react";
import ProgressBar from "../components/ProgressBar";
import AudioPlayer from "../components/AudioPlayer";
import { getCurrentUser } from "../utils/store.js";

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [textInput, setTextInput] = useState(""); // 🔥 new
  const [customId, setCustomId] = useState("output");
  const [voiceId, setVoiceId] = useState("6sFKzaJr574YWVu4UuJF"); // default
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);

  const token = getCurrentUser()?.access_token;

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const fetchProgress = async () => {
    try {
      const res = await fetch(`https://audio-gen-backend-o6nr.onrender.com/progress/${customId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setProgress(data.percent);
      if (data.percent < 100) setTimeout(fetchProgress, 1000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !textInput.trim()) {
      setError("Please upload a file or enter text.");
      return;
    }

    setLoading(true);
    setProgress(0);
    setError(null);
    setAudioUrl(null);

    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      } else {
        // convert textarea text into a virtual file
        const blob = new Blob([textInput], { type: "text/plain" });
        formData.append("file", blob, "input.txt");
      }
      formData.append("custom_id", customId);
      formData.append("voice_id", voiceId);

      const response = await fetch("https://audio-gen-backend-o6nr.onrender.com/generate-audio/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail || "Failed to generate audio");
      }

      fetchProgress();

      const result = await response.json();
      setAudioUrl(`https://audio-gen-backend-o6nr.onrender.com/${result.file_path.replace("\\", "/")}`);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto" }}>
      <form onSubmit={handleSubmit}>
        <label>
          Upload text file:
          <input type="file" accept=".txt" onChange={handleFileChange} />
        </label>
        <br />
        <label>
          Text Input:
          <textarea
            rows="5"
            style={{ width: "100%", marginTop: "5px" }}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
        </label>
        <br />
        <label>
          Audio Title / File Name:
          <input
            type="text"
            value={customId}
            onChange={(e) => setCustomId(e.target.value)}
          />
        </label>
        <br />
        <label>
          Elevenlabs Voice ID:
          <input
            type="text"
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
          />
        </label>
        <br />
        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate Audio"}
        </button>
      </form>

      {loading && <ProgressBar percent={progress} />}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {audioUrl && <AudioPlayer url={audioUrl} filename={`${customId}.mp3`} />}
    </div>
  );
}
