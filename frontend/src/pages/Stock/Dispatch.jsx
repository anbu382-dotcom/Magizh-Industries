import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import '../../styles/pageStyles/Stock.css';

const Dispatch = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <div className="stock-container">
      <Sidebar isExpanded={sidebarExpanded} onToggle={setSidebarExpanded} />
      <Navbar title="Dispatch" onMenuClick={() => setSidebarExpanded(!sidebarExpanded)} />
      <div className="main-content page-with-navbar">
        <div className="content-wrapper">
          <div className="coming-soon">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <h2>Coming Soon</h2>
            <p>This feature is under development</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dispatch;
