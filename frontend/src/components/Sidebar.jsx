import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Package, LogOut, Warehouse } from 'lucide-react';
import '../styles/componentStyles/Sidebar.css';

const Sidebar = ({ isAdmin = false, isExpanded, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Home', icon: Home, path: '/home' },
    { name: 'Stock', icon: Package, path: '/stock' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (onToggle) onToggle(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      {/* Overlay */}
      {isExpanded && <div className="sidebar-overlay" onClick={() => onToggle && onToggle(false)}></div>}

      {/* Sidebar */}
      <div className={`sidebar ${isExpanded ? 'expanded' : ''}`}>
        {/* Company Header */}
        <div className="sidebar-header">
          <Warehouse className="sidebar-logo" size={28} />
          <span className="sidebar-company-name">Magizh Industries</span>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.name}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path)}
              >
                <Icon className="nav-icon" size={22} />
                <span className="nav-text">{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut className="nav-icon" size={22} />
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
