import React from "react";

const Footer = () => {
  return (
    <div style={styles.footer}>
      <p style={styles.text}>
        Developed by K. Prarana. For further details, please contact @{" "}
        <a href="mailto:kprarana@gmail.com" style={styles.link}>
          kprarana@gmail.com
        </a>
      </p>
    </div>
  );
};

const styles = {
  footer: {
    backgroundColor: "#00008B",
    color: "#fff",
    padding: "1rem 2rem",
    textAlign: "center",
    fontFamily: "'Segoe UI', sans-serif",
  },
  text: {
    margin: 0,
    fontSize: "13px",
    fontWeight: "400",
    fontStyle: "italic",
  },
  link: {
    color: "#fff",
    textDecoration: "underline",
  },
};

export default Footer;
