import React from "react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <div style={styles.sknFlxFooter}>
      <p style={styles.sknTxtFooter}>
        {t("developedBy")}{" "}
        <a href="mailto:kprarana@gmail.com" style={styles.sknLink}>
          kprarana@gmail.com
        </a>
      </p>
    </div>
  );
};

const styles = {
  sknFlxFooter: {
    backgroundColor: "#00008B",
    color: "#fff",
    padding: "1rem 2rem",
    textAlign: "center",
    fontFamily: "'Segoe UI', sans-serif",
  },
  sknTxtFooter: {
    margin: 0,
    fontSize: "13px",
    fontWeight: "400",
    fontStyle: "italic",
  },
  sknLink: {
    color: "#fff",
    textDecoration: "underline",
  },
};

export default Footer;
