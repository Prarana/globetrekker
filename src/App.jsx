import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';          
import Home from './pages/Home';          
import { useAuth } from './context/AuthContext';
import './App.css';
import Trips from './pages/Trips';        

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>; 

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


