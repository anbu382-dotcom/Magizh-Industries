import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Package, BarChart3, Shield, Users } from 'lucide-react';
import DatePicker from '../components/datepicker';
import Loader from '../components/loader';
import '../styles/pageStyles/login.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: Package,
      title: "Inventory Management",
      description: "Efficiently track and manage your stock. Real-time updates, Material Master , Stock Entry  integration with your workflow."
    },
    {
      icon: BarChart3,
      title: " Analytics & Reports",
      description: "Gain insights with Log Report. Generate detailed reports, track trends."
    },
    {
      icon: Shield,
      title: "Secure & Valid Authorisation ",
      description: "Your data is protected with Firebase security. Role-based access control, audit trails, and encrypted storage ensure complete peace of mind."
    },
    {
      icon: Users,
      title: "User Management",
      description: "Wanna Signup? Get approve From admin by entering the Credentials!. Receive your user ID and password via email upon approval."
    }
  ];

  // Clear authentication token when login page is accessed
  // This prevents back button navigation from bypassing authentication
  useEffect(() => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }, []);

  // Auto-rotate features every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [features.length]);

  // Form Data States
  const [loginData, setLoginData] = useState({ userId: '', password: '' });
  const [regData, setRegData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    fatherName: '',
    dob: ''
  });

  // Handlers
  const handleLoginChange = (e) => {
    setLoginData({...loginData, [e.target.name]: e.target.value});
    if (loginError) setLoginError(false);
  };
  const handleRegChange = (e) => setRegData({...regData, [e.target.name]: e.target.value});

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setLoginError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const startTime = Date.now();

    if(isLogin) {
        // Login API logic
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: loginData.userId,
              password: loginData.password
            })
          });

          const data = await response.json();

          if (response.ok && data.token) {
            // Store JWT token in sessionStorage
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('user', JSON.stringify(data.user));

            // Ensure loader shows for at least 2 seconds
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 2000 - elapsedTime);
            
            setTimeout(() => {
              navigate('/home');
            }, remainingTime);
          } else {
            // Log error for debugging
            console.error('Login failed:', data.message || 'Unknown error');
            
            // Ensure loader shows for at least 2 seconds
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 2000 - elapsedTime);
            
            setTimeout(() => {
              setIsLoading(false);
              setLoginError(true);
            }, remainingTime);
          }
        } catch (error) {
          // Ensure loader shows for at least 2 seconds
          const elapsedTime = Date.now() - startTime;
          const remainingTime = Math.max(0, 2000 - elapsedTime);
          
          setTimeout(() => {
            setIsLoading(false);
            setLoginError(true);
            console.error('Login error:', error);
          }, remainingTime);
        }
    } else {
        // Registration API logic
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register-request`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(regData)
          });

          const data = await response.json();

          if (response.ok) {
            // Ensure loader shows for at least 2 seconds
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 2000 - elapsedTime);
            
            setTimeout(() => {
              setIsLoading(false);
              setShowSuccess(true);
              setRegData({
                firstName: '',
                lastName: '',
                email: '',
                fatherName: '',
                dob: ''
              });

              setTimeout(() => {
                setShowSuccess(false);
                setIsLogin(true);
              }, 4000);
            }, remainingTime);
          } else {
            // Ensure loader shows for at least 3 seconds
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 2000 - elapsedTime);
            
            setTimeout(() => {
              setIsLoading(false);
              console.error('Registration failed:', data);

              // Handle specific error cases
              if (data.status === 'already_requested') {
                alert('⚠️ Request Already Submitted\n\n' + data.message);
              } else if (data.status === 'already_exists') {
                alert('⚠️ Account Already Exists\n\n' + data.message);
                // Optionally switch to login view
                setTimeout(() => setIsLogin(true), 2000);
              } else if (data.status === 'rejected') {
                alert('❌ Previous Request Rejected\n\n' + data.message);
              } else {
                alert(data.message || 'Failed to send registration request. Please try again.');
              }
            }, remainingTime);
          }
        } catch (error) {
          // Ensure loader shows for at least 2 seconds
          const elapsedTime = Date.now() - startTime;
          const remainingTime = Math.max(0, 2000 - elapsedTime);
          
          setTimeout(() => {
            setIsLoading(false);
            console.error('Registration error:', error);
            alert('Failed to send registration request. Please check your connection and try again.');
          }, remainingTime);
        }
    }
  };

  return (
    <>
      {isLoading && <Loader />}
      <div className="auth-container">
        {/* Left Content Section */}
        <div className="content-section">
          <div className="feature-display">
            <div className="feature-icon-wrapper">
              {(() => {
                const IconComponent = features[activeFeature].icon;
                return <IconComponent className="feature-icon" size={48} />;
              })()}
            </div>
            <h1 className="content-heading" key={activeFeature}>
              {features[activeFeature].title}
            </h1>
            <p className="content-text" key={`desc-${activeFeature}`}>
              {features[activeFeature].description}
            </p>
            <div className="feature-indicators">
              {features.map((_, index) => (
                <div
                  key={index}
                  className={`indicator-dot ${activeFeature === index ? 'active' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Section - The Form */}
        <div className="form-section">
          <div className="form-wrapper">
            {/* Header & Logo */}
            <div className="header_heading">
              <h1>{isLogin ? 'Welcome back!' : 'Create Account'}</h1>
              <p className="subtitle">
                {isLogin ? 'Welcome back! Please enter your details.' : 'Please enter your details to sign up.'}
              </p>
            </div>

            {showSuccess && (
              <div className="success-message">
                <svg viewBox="0 0 24 24">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <div className="success-message-content">
                  <h4>Request Sent Successfully!</h4>
                  <p>Your registration request has been sent to the administrator for approval.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {isLogin ? (
                // --- LOGIN FIELDS ---
                <>
                  <div className="input-group">
                    <label htmlFor="userId">User ID <span className="required">*</span></label>
                    <input
                      type="text"
                      id="userId"
                      name="userId"
                      placeholder="Enter your employee ID"
                      value={loginData.userId}
                      onChange={handleLoginChange}
                      className={loginError ? 'input-error' : ''}
                      required
                    />
                  </div>

                  <div className="input-group password-group">
                    <label htmlFor="password">Password <span className="required">*</span></label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        placeholder="••••••••••••"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        className={loginError ? 'input-error' : ''}
                        required
                      />
                      <button
                        type="button"
                        className="eye-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex="-1"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                // --- SIGNUP FIELDS ---
                <div className="signup-grid">
                  <div className="signup-row">
                    <div className="input-group">
                      <label htmlFor="firstName">First Name <span className="required">*</span></label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        placeholder="John"
                        value={regData.firstName}
                        onChange={handleRegChange}
                        required
                      />
                    </div>
                    
                    <div className="input-group">
                      <label htmlFor="lastName">Last Name <span className="required">*</span></label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        placeholder="Doe"
                        value={regData.lastName}
                        onChange={handleRegChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label htmlFor="email">Email <span className="required">*</span></label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="john@example.com"
                      value={regData.email}
                      onChange={handleRegChange}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label>Date of Birth <span className="required">*</span></label>
                    <DatePicker
                      value={regData.dob}
                      onChange={(date) => setRegData({...regData, dob: date})}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="fatherName">Father's Name <span className="required">*</span></label>
                    <input
                      type="text"
                      id="fatherName"
                      name="fatherName"
                      placeholder="Required for registration"
                      value={regData.fatherName}
                      onChange={handleRegChange}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button type="submit" className="main-btn">
                {isLogin ? 'Login' : 'Sign Up'}
              </button>
            </form>

            {/* Toggle Mode Link */}
            <div className="toggle-link-container">
              {isLogin ? (
                <p>Don't have an account? <button type="button" className="link-btn" onClick={handleToggleMode}>Sign Up</button></p>
              ) : (
                <p>Already have an account? <button type="button" className="link-btn" onClick={handleToggleMode}>Login</button></p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthPage;
