import React from 'react';
import Sidebar from '../../components/Sidebar';
import '../../styles/pageStyles/Stock.css';

const Dispatch = () => {
  return (
    <div className="stock-container">
      <Sidebar />
      <div className="main-content">
        <div className="content-wrapper">
          <div className="stock-header">
            <h1 className="page-title">Dispatch</h1>
            <p className="page-subtitle">Stock dispatch and delivery management</p>
          </div>
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
