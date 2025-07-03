import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';          // Combined Login + Signup
import Home from './pages/Home';          // Combined Home + SearchForm
import { useAuth } from './context/AuthContext';
import './App.css';
// import Trips from './pages/Trips';        // Combined TripDetails + MyTrips

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;


//preview cgpt

// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import Login from './auth/Login';
// import Signup from './auth/Signup';
// import Home from './pages/Home.jsx';
// import SearchForm from './pages/SearchForm';
// import TripDetails from './pages/TripDetails';
// import MyTrips from './pages/MyTrips';
// import Auth from './pages/Auth';


// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/auth" element={<Auth />} />
//         <Route path="/" element={<Home />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/signup" element={<Signup />} />
//         <Route path="/search" element={<SearchForm />} />
//         <Route path="/trip/:id" element={<TripDetails />} />
//         <Route path="/mytrips" element={<MyTrips />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;

