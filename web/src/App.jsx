import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Farmer from './pages/Farmer';
import Officer from './pages/Officer';
import Gov from './pages/Gov';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/farm/recommendations" element={<Farmer mode="plan" />} />
        <Route path="/farm/idea" element={<Farmer mode="idea" />} />
        <Route path="/farm/planted" element={<Farmer mode="monitor" />} />
        <Route path="/officer" element={<Officer />} />
        <Route path="/gov" element={<Gov />} />
      </Routes>
    </Router>
  );
}