import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';          // Combined Login + Signup
import Home from './pages/Home';          // Combined Home + SearchForm
import { useAuth } from './context/AuthContext';
import './App.css';
import Trips from './pages/Trips';        // Combined TripDetails + MyTrips

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


