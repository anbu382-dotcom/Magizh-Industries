import { X, AlertTriangle, ShieldCheck } from 'lucide-react';
import '../styles/componentStyles/popup.css';
// Delete Master popup component
const Popup = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info', // 'info', 'warning', 'danger'
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  children
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle size={48} className="popup-icon danger" />;
      case 'warning':
        return <AlertTriangle size={48} className="popup-icon warning" />;
      default:
        return <ShieldCheck size={48} className="popup-icon info" />;
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="popup-overlay" onClick={handleOverlayClick}>
      <div className="popup-container" onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="popup-header">
            <h2 className="popup-title">{title}</h2>
          </div>
        )}

        <div className="popup-content">
          {message && <p className="popup-message">{message}</p>}
          {children}
        </div>

        <div className="popup-actions">
          <button
            className="popup-btn popup-btn-cancel"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            className={`popup-btn popup-btn-confirm ${type}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Reusable Status Message popup component
const StatusMessage = ({ message }) => {
  return (
    <div className="stock-overlay">
      <div className="stock-card">
        <div className="stock-status-text">
          <h2 className="stock-title">{message}</h2>
        </div>
        <div className="stock-progress-container">
          <div className="stock-progress-bar"></div>
        </div>
      </div>
    </div>
  );
};

export { StatusMessage };
export default Popup;
