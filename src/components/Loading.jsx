import React from "react";

const Loading = () => {
  return (
    <div style={styles.sknFlxOverlay}>
      <div style={styles.spinner}></div>
    </div>
  );
};

const styles = {
  sknFlxOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 2,
    width: "100vw",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(2px)",
  },
  spinner: {
    width: "60px",
    height: "60px",
    border: "8px solid #f3f3f3",
    borderTop: "8px solid #d0006f", 
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};

const style = document.createElement("style");
style.innerHTML = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`;
document.head.appendChild(style);

export default Loading;
