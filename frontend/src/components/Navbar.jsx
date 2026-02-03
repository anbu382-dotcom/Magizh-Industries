import { Warehouse } from 'lucide-react';
import '../styles/componentStyles/Navbar.css';

const Navbar = ({ title = 'Stock Management', onMenuClick, rightContent }) => {
  const handleIconClick = () => {
    if (onMenuClick) {
      onMenuClick();
    }
  };

  const handleIconHover = () => {
    if (onMenuClick) {
      onMenuClick();
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <Warehouse 
            className="navbar-icon" 
            size={28} 
            onClick={handleIconClick}
            onMouseEnter={handleIconHover}
            style={{ cursor: 'pointer' }}
          />
        </div>
        <h1 className="navbar-title">{title}</h1>
        {rightContent && <div className="navbar-right">{rightContent}</div>}
      </div>
    </nav>
  );
};

export default Navbar;
