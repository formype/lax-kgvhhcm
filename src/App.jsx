import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Survey from './pages/Survey';
import CreativeCorner from './pages/CreativeCorner';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/khao-sat" element={<Survey />} />
        <Route path="/goc-sang-tao" element={<CreativeCorner />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;
