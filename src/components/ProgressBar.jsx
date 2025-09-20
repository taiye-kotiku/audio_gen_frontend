import React from "react";

export default function ProgressBar({ percent }) {
  return (
    <div style={{ marginTop: "10px" }}>
      <div style={{ width: "100%", background: "#eee", height: "20px", borderRadius: "5px" }}>
        <div
          style={{
            width: `${percent}%`,
            background: "#4caf50",
            height: "100%",
            borderRadius: "5px",
            transition: "width 0.5s",
          }}
        />
      </div>
      <p>{percent}%</p>
    </div>
  );
}
