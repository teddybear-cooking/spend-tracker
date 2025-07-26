import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navigation from './components/Navigation';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import Journal from './pages/Journal';

function App() {
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const savedTheme = localStorage.getItem('spending_tracker_theme');
    return savedTheme ? savedTheme === 'dark' : false;
  });

  useEffect(() => {
    localStorage.setItem('spending_tracker_theme', isDarkTheme ? 'dark' : 'light');
    document.body.className = isDarkTheme ? 'dark-theme' : 'light-theme';
  }, [isDarkTheme]);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  return (
    <Router>
      <div className={`App ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
        <Navigation isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />
        <main className="main-content">
          <Routes>
            <Route exact path="/" element={<Journal />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="*" element={<Journal />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
