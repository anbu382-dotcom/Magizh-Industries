import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import '../styles/pageStyles/Stock.css';

const Stock = ({ isAdmin = false }) => {
  const navigate = useNavigate();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const handleMenuClick = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const masterModules = [
    {
      title: 'Material Master',
      description: 'Manage material master data',
      path: '/stock/master',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
          <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
          <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      )
    }
  ];

  const otherModules = [
    {
      title: 'Entry',
      description: 'Stock entry and inventory updates',
      path: '/stock/entry',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="12" y1="18" x2="12" y2="12"></line>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
      )
    },
    {
      title: 'Report',
      description: 'Stock reports and analytics',
      path: '/stock/report',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      )
    }

  ];

  return (
    <div className="stock-container">
      <Sidebar isAdmin={isAdmin} isExpanded={sidebarExpanded} onToggle={setSidebarExpanded} />
      <Navbar title="Stock Management" onMenuClick={handleMenuClick} showCompanyName={sidebarExpanded} />

      <div className="main-content page-with-navbar">
        <div className="content-wrapper">
          {/* Master Modules Section */}
          <div className="master-section">
            {/* Master Card */}
            <div
              className="stock-module-card master-card-large"
              onClick={() => navigate(masterModules[0].path)}
            >
              <div className="module-icon">{masterModules[0].icon}</div>
              <h3 className="module-title">{masterModules[0].title}</h3>
              <p className="module-description">{masterModules[0].description}</p>
              <div className="module-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </div>
          </div>

          {/* Other Modules Section */}
          <div className="stock-modules-grid">
            {otherModules.map((module, index) => (
              <div
                key={index}
                className="stock-module-card"
                onClick={() => navigate(module.path)}
              >
                <div className="module-icon">{module.icon}</div>
                <h3 className="module-title">{module.title}</h3>
                <p className="module-description">{module.description}</p>
                <div className="module-arrow">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stock;
