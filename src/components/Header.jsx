import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useTranslation } from "react-i18next";

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const onClickNavigate = (path) => {
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  const onClickSignout = async () => {
    if (user) {
      await signOut(auth);
    }
    navigate("/");
  };

  return (
    <div style={styles.sknFlxHeader}>
      <div style={styles.sknFlxLeft}>
        <div onClick={() => onClickNavigate("/home")} style={styles.sknTxtNavItem}>
        {t("home")}
        </div>
        <div onClick={() => onClickNavigate("/trips")} style={styles.sknTxtNavItem}>
        {t("trips")}
        </div>
      </div>
      <div onClick={onClickSignout} style={styles.sknSignout}>
      {user ? t("signOut") : t("signIn")}
      </div>
    </div>
  );
};

const styles = {
  sknFlxHeader: {
    backgroundColor: "#00008B",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    fontFamily: "'Segoe UI', sans-serif",
  },
  sknFlxLeft: {
    display: "flex",
    gap: "3rem",
  },
  sknTxtNavItem: {
    cursor: "pointer",
    fontWeight: "400",
    fontSize: "13px",
    borderBottom: "2px solid transparent",
  },
  sknSignout: {
    cursor: "pointer",
    fontWeight: "400",
    fontSize: "13px",
  },
};

export default Header;
