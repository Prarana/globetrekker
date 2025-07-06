import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React, { useEffect } from "react";
import Auth from './pages/Auth';          
import Home from './pages/Home';          
import { useAuth } from './context/AuthContext';
import './App.css';
import Trips from './pages/Trips';     
import { useTranslation } from "react-i18next";   

function App() {
  const { user } = useAuth();
  const { i18n } = useTranslation();

  useEffect(() => {
    const dir = i18n.language === "ar" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
  }, [i18n.language]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={!user ? <Auth /> : <Navigate to="/home" />}
        />
        <Route
          path="/home"
          element={user ? <Home /> : <Navigate to="/" />}
        />
        <Route
          path="/trips"
          element={user ? <Trips /> : <Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


