
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Package, LogOut, Warehouse, Menu, X } from 'lucide-react';
import '../styles/componentStyles/Sidebar.css';

const Sidebar = ({ isAdmin = false }) => {
  const [showName, setShowName] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Home', icon: Home, path: '/home', showForAll: true },
    { name: 'Stock', icon: Package, path: '/stock', showForAll: true },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    console.log('Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const toggleDesktopMenu = () => {
    setIsDesktopExpanded(!isDesktopExpanded);
  };

  const handleToggle = () => {
    toggleMobileMenu();
    toggleDesktopMenu();
  };

  const handleOverlayClick = () => {
    setIsMobileOpen(false);
    setIsDesktopExpanded(false);
  };

  return (
    <>
      {/* Desktop & Mobile Menu Toggle Button */}
      {!isMobileOpen && !isDesktopExpanded && (
        <button
          className="menu-toggle-button"
          onClick={handleToggle}
        >
          <Warehouse size={32} />
        </button>
      )}

      {/* Overlay for mobile */}
      {isMobileOpen && <div className="sidebar-overlay" onClick={handleOverlayClick}></div>}

      <div
        className={`sidebar ${isMobileOpen ? 'mobile-open' : ''} ${isDesktopExpanded ? 'desktop-expanded' : ''}`}
      >
        {/* Header Section */}
        <div className="sidebar-header">
          <div className="logo-container" onClick={handleToggle} style={{ cursor: 'pointer' }}>
            <Warehouse className="warehouse-icon" size={40} />
            <span className="company-name">Magizh Industries</span>
          </div>
        </div>

      {/* Navigation Items */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          // Hide admin-only items for non-admin users
          if (item.adminOnly && !isAdmin) {
            return null;
          }

          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.name}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                handleNavigation(item.path);
                setIsMobileOpen(false);
              }}
              title={!isMobileOpen ? item.name : ''}
            >
              <Icon className="nav-icon" size={22} />
              <span className="nav-text">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout} title={!isMobileOpen ? 'Logout' : ''}>
          <LogOut className="nav-icon" size={22} />
          <span className="nav-text">Logout</span>
        </button>
      </div>
    </div>
    </>
  );
};

export default Sidebar;
