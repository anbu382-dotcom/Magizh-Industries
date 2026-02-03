import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import UserManagement from '../components/UserManagement';
import { Users } from 'lucide-react';
import '../styles/pageStyles/Home.css';

const Home = ({ isAdmin: isAdminProp = false }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // Robust back button handling - always redirect to login
  const handleBackNavigation = useCallback(() => {
    navigate('/login', { replace: true });
  }, [navigate]);

  useEffect(() => {
    // Push state twice to create a buffer for back button detection
    window.history.pushState({ page: 'home' }, '', window.location.href);
    window.history.pushState({ page: 'home' }, '', window.location.href);
    
    const handlePopState = (event) => {
      // Always redirect to login on any back navigation
      handleBackNavigation();
    };

    window.addEventListener('popstate', handlePopState);

    // Also handle beforeunload for additional safety
    const handleBeforeUnload = () => {
      window.history.pushState({ page: 'home' }, '', window.location.href);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [handleBackNavigation]);

  useEffect(() => {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        // Check role directly from sessionStorage
        setIsAdmin(parsedUser.role === 'admin');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="home-container">
      <Sidebar isAdmin={isAdmin} isExpanded={sidebarExpanded} onToggle={setSidebarExpanded} />
      <Navbar title="Welcome To Magizh Industries !" onMenuClick={() => setSidebarExpanded(!sidebarExpanded)} />

      <div className="main-content page-with-navbar">
        <div className="content-wrapper">
          <div className="welcome-header">
            <div className="greeting-section">
              <h1 className="greeting-title">{getCurrentGreeting()}, {user?.firstName}</h1>
              <p className="greeting-subtitle">Welcome back to Magizh Industries</p>
            </div>
            <div className="user-badge">
              <div className="badge-icon">
                <Users size={24} />
              </div>
              <div className="badge-info">
                <span className="badge-label">{isAdmin ? 'Admin ID' : 'Employee ID'}</span>
                <span className="badge-value">{user?.userId}</span>
              </div>
            </div>
          </div>

          {isAdmin && (
            <UserManagement />
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
