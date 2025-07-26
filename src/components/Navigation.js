import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navigation.css';

const Navigation = ({ isDarkTheme, toggleTheme }) => {
  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-logo">
          <NavLink to="/" className="nav-logo-link">
            <h1>Spending Tracker</h1>
          </NavLink>
        </div>
        <div className="nav-links">
          <NavLink 
            to="/journal" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Journal
          </NavLink>
          <NavLink 
            to="/analytics" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Analytics Dashboard
          </NavLink>
          <button 
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={isDarkTheme ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkTheme ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 