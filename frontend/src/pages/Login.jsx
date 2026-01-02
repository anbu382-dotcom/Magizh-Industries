import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
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

            // Ensure loader shows for at least 3 seconds
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 3000 - elapsedTime);
            
            setTimeout(() => {
              navigate('/home');
            }, remainingTime);
          } else {
            // Log error for debugging
            console.error('Login failed:', data.message || 'Unknown error');
            
            // Ensure loader shows for at least 3 seconds
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 3000 - elapsedTime);
            
            setTimeout(() => {
              setIsLoading(false);
              setLoginError(true);
            }, remainingTime);
          }
        } catch (error) {
          // Ensure loader shows for at least 3 seconds
          const elapsedTime = Date.now() - startTime;
          const remainingTime = Math.max(0, 3000 - elapsedTime);
          
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
            // Ensure loader shows for at least 3 seconds
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 3000 - elapsedTime);
            
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
            const remainingTime = Math.max(0, 3000 - elapsedTime);
            
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
          // Ensure loader shows for at least 3 seconds
          const elapsedTime = Date.now() - startTime;
          const remainingTime = Math.max(0, 3000 - elapsedTime);
          
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
        <div className="auth-card">

        {/* LEFT SIDE: Visual */}
        <div className="visual-side">
          <div className="visual-content">
            <h2>{isLogin ? "Welcome Back" : "Join Our Team"}</h2>
            <p>
              {isLogin
                ? "Access your Magizh Industries dashboard"
                : "Submit your registration for admin approval"}
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: Forms */}
        <div className="form-side">
          <div className="form-header">
            <h3>{isLogin ? "Login" : "Register Request"}</h3>
            <p>{isLogin ? "Enter your credentials" : "Fill the details below"}</p>
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

            {/* LOGIN FORM FIELDS */}
            {isLogin && (
              <>
                <div className="input-group">
                  <label>User ID</label>
                  <div className={`input-wrapper ${loginError ? 'input-error' : ''}`}>
                    <svg className="input-icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <input
                      type="text"
                      name="userId"
                      className="auth-input"
                      placeholder="Enter your employee ID"
                      value={loginData.userId}
                      onChange={handleLoginChange}
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Password</label>
                  <div className={`input-wrapper ${loginError ? 'input-error' : ''}`}>
                    <svg className="input-icon" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className="auth-input"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="submit-btn">Login</button>
              </>
            )}

            {/* REGISTER FORM FIELDS */}
            {!isLogin && (
              <>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div className="input-group" style={{ width: '50%' }}>
                    <label>First Name</label>
                    <div className="input-wrapper">
                      <svg className="input-icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      <input
                          type="text"
                          name="firstName"
                          className="auth-input"
                          placeholder="John"
                          value={regData.firstName}
                          onChange={handleRegChange}
                          required
                      />
                    </div>
                    </div>
                    <div className="input-group" style={{ width: '50%' }}>
                    <label>Last Name</label>
                    <div className="input-wrapper">
                      <svg className="input-icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      <input
                          type="text"
                          name="lastName"
                          className="auth-input"
                          placeholder="Doe"
                          value={regData.lastName}
                          onChange={handleRegChange}
                          required
                      />
                    </div>
                    </div>
                </div>

                <div className="input-group">
                  <label>Email Address</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    <input
                      type="email"
                      name="email"
                      className="auth-input"
                      placeholder="name@company.com"
                      value={regData.email}
                      onChange={handleRegChange}
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Date of Birth</label>
                  <DatePicker
                    value={regData.dob}
                    onChange={(date) => setRegData({...regData, dob: date})}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Father's Name</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <input
                      type="text"
                      name="fatherName"
                      className="auth-input"
                      placeholder="Required for registration"
                      value={regData.fatherName}
                      onChange={handleRegChange}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="submit-btn request-btn">Send Request</button>
              </>
            )}

          </form>

          <div className="toggle-container">
            {isLogin ? "New Employee?" : "Already have an ID?"}
            <button className="toggle-btn" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Register Here" : "Login Here"}
            </button>
          </div>

        </div>
      </div>
    </div>
    </>
  );
};

export default AuthPage;
