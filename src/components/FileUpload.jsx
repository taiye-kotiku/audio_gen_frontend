import React, { useState } from "react";
import ProgressBar from "./ProgressBar";
import AudioPlayer from "./AudioPlayer";
import { getCurrentUser } from "../utils/store.js";
import { api } from "../utils/api.js";

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [customId, setCustomId] = useState("output");
  const [voiceId, setVoiceId] = useState("6sFKzaJr574YWVu4UuJF"); // default
  const [textInput, setTextInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);

  const token = getCurrentUser()?.access_token;

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const fetchProgress = async () => {
    try {
      const res = await api.get(`/progress/${customId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProgress(res.data.percent);
      if (res.data.percent < 100) setTimeout(fetchProgress, 1000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !textInput.trim()) {
      setError("Please upload a file or enter text");
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
      } else if (textInput.trim()) {
        const blob = new Blob([textInput], { type: "text/plain" });
        formData.append("file", blob, "input.txt");
      }
      formData.append("custom_id", customId);
      formData.append("voice_id", voiceId);

      const response = await api.post("/generate-audio/", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Start polling for progress
      fetchProgress();

      setAudioUrl(`${api.defaults.baseURL}/${response.data.file_path}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to generate audio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto" }}>
      <form onSubmit={handleSubmit}>
        <label>
          Enter text:
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            rows="4"
            style={{ width: "100%" }}
          />
        </label>
        <br />

        <label>
          Select text file:
          <input type="file" accept=".txt" onChange={handleFileChange} />
        </label>
        <br />

        <label>
          Voice ID:
          <input
            type="text"
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
          />
        </label>
        <br />

        <label>
          Custom ID:
          <input
            type="text"
            value={customId}
            onChange={(e) => setCustomId(e.target.value)}
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
