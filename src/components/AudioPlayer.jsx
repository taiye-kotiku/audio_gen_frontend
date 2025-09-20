import React from "react";

export default function AudioPlayer({ url, filename }) {
  if (!url) return null;

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Audio Ready:</h3>
      <audio controls src={url}></audio>
      <br />
      <a href={url} download={filename}>
        Download
      </a>
    </div>
  );
}
