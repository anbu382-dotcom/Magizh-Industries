import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import DatePicker from './datepicker';
import '../styles/componentStyles/DownloadPopup.css';

const DownloadPopup = ({ isOpen, onClose, onDownload, title = "Download Report", showDateRange = true }) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const handleDownload = () => {
    if (showDateRange && fromDate && toDate) {
      if (new Date(fromDate) > new Date(toDate)) {
        alert('From date cannot be later than To date');
        return;
      }
    }

    onDownload({ fromDate, toDate });
    handleClose();
  };

  const handleClose = () => {
    setFromDate('');
    setToDate('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="download-popup-overlay" onClick={handleClose}>
      <div className="download-popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="download-popup-header">
          <h3>{title}</h3>
        </div>

        <div className="download-popup-body">
          {showDateRange && (
            <>
              <div className="download-date-group">
                <label>From Date:</label>
                <DatePicker
                  value={fromDate}
                  onChange={setFromDate}
                  required
                />
              </div>

              <div className="download-date-group">
                <label>To Date:</label>
                <DatePicker
                  value={toDate}
                  onChange={setToDate}
                  required
                  disabled={!fromDate}
                />
              </div>
            </>
          )}
        </div>

        <div className="download-popup-footer">
          <button className="download-cancel-btn" onClick={handleClose}>
            Cancel
          </button>
          <button className="download-submit-btn" onClick={handleDownload}>
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadPopup;
