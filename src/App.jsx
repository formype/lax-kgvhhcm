import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PageProvider, usePage } from './context/PageContext';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Survey from './pages/Survey';
import CreativeCorner from './pages/CreativeCorner';

function PublicPages() {
  const { activePage } = usePage();

  if (activePage === 'creative') return <CreativeCorner />;
  if (activePage === 'survey') return <Survey />;
  return <Home />;
}

function App() {
  return (
    <PageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<PublicPages />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </PageProvider>
  );
}

export default App;
