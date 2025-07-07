import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();

  const onClickChangeLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
  };

  const onClickSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) 
        await signInWithEmailAndPassword(auth, email, password);
      else 
        await createUserWithEmailAndPassword(auth, email, password);

      setTimeout(() => { navigate("/home");}, 1500);
    } 
    catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.sknFlxMain}>
      <div style={styles.sknFlxMainContainer}>
        <h2 style={styles.sknTxtHeading}>
          {isLogin
            ? t("LogintoGlobeTrekker")
            : t("CreateYourGlobeTrekkerAccount")}
        </h2>
        <form onSubmit={onClickSubmit} style={styles.sknMainForm}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            style={styles.sknTxtInput}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            style={styles.sknTxtInput}
          />
          {error && <p style={styles.sknErrorRed}>{error}</p>}
          <button type="submit" style={styles.sknButton}>
            {isLogin ? t("Login") : t("Signup")}
          </button>
        </form>
        <p style={styles.sknToggle}>
          {isLogin
            ? t("Donothaveanaccount")
            : t("CreateYourGlobeTrekkerAccount")}{" "}
          <span onClick={() => setIsLogin(!isLogin)} style={styles.sknLink}>
            {isLogin ? t("Signup") : t("Login")}
          </span>
        </p>
        <span onClick={() => onClickChangeLanguage()} style={styles.sknLink}>
          {t("changeToArabic")}
        </span>
      </div>
    </div>
  );
}

const styles = {
  sknFlxMain: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Segoe UI, sans-serif",
    backdropFilter: "blur(5px)",
  },
  sknFlxMainContainer: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "2rem",
    textAlign: "center",
  },
  sknTxtHeading: {
    fontSize: "20px",
    fontWeight: "700",
    marginBottom: "1.5rem",
    color: "#d0006f",
  },
  sknMainForm: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  sknTxtInput: {
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "15px",
    outline: "none",
  },
  sknButton: {
    marginTop: "1rem",
    padding: "0.85rem",
    backgroundColor: "#d0006f",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
  },
  sknToggle: {
    marginTop: "1.25rem",
    fontSize: "14px",
  },
  sknLink: {
    color: "#d0006f",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
  },
  sknErrorRed: {
    color: "red",
    fontSize: "13px",
  },
};

export default Auth;
