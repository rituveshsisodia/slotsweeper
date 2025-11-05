import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

function App() {
  const isLoggedIn = !!localStorage.getItem("token"); // check if token exists

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white text-4xl font-bold">
      Tailwind + React 19 ✅
    </div>
    // <Router>
    //   <div style={{ textAlign: "center", padding: "20px" }}>
    //     <h1>SlotSwapper</h1>
    //     <Routes>
    //       <Route path="/" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />} />
    //       <Route path="/signup" element={<Signup />} />
    //       <Route path="/login" element={<Login />} />
    //       <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
    //     </Routes>
    //   </div>
    // </Router>
  );
}

export default App;
