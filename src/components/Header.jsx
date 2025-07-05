import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path) => {
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  const handleAuthClick = async () => {
    if (user) {
      await signOut(auth);
    }
    navigate("/");
  };

  return (
    <div style={styles.header}>
      <div style={styles.navLeft}>
        <div onClick={() => handleNav("/home")} style={styles.navItem}>
          HOME
        </div>
        <div onClick={() => handleNav("/trips")} style={styles.navItem}>
          TRIPS
        </div>
      </div>
      <div onClick={handleAuthClick} style={styles.authItem}>
        {user ? "SIGN OUT" : "SIGN IN"}
      </div>
    </div>
  );
};

const styles = {
  header: {
    backgroundColor: "#00008B",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    fontFamily: "'Segoe UI', sans-serif",
  },
  navLeft: {
    display: "flex",
    gap: "3rem",
  },
  navItem: {
    cursor: "pointer",
    fontWeight: "400",
    fontSize: "14px",
    paddingBottom: "4px",
    borderBottom: "2px solid transparent",
  },
  authItem: {
    cursor: "pointer",
    fontWeight: "400",
    fontSize: "14px",
  },
};

export default Header;
