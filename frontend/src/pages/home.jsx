import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import UserManagement from '../components/UserManagement';
import { Users } from 'lucide-react';
import '../styles/pageStyles/Home.css';

const Home = ({ isAdmin: isAdminProp = false }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        // Check role directly from localStorage
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
      <Sidebar isAdmin={isAdmin} />

      <div className="main-content">
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
