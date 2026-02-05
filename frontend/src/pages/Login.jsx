import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Package, BarChart3, Shield, Users } from 'lucide-react';
import DatePicker from '../components/datepicker';
import Loader from '../components/loader';
import Popup, { StatusMessage } from '../components/popup';
import '../styles/pageStyles/login.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  
  // Forgot Password States
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [showRejectedPopup, setShowRejectedPopup] = useState(false);
  const [rejectedMessage, setRejectedMessage] = useState('');

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

  // Auto-change features every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [features.length]);

  // OTP Timer
  useEffect(() => {
    let interval;
    if (forgotPasswordStep === 2 && otpTimer > 0 && !canResendOtp) {
      interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            setCanResendOtp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [forgotPasswordStep, otpTimer, canResendOtp]);

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
    setShowForgotPassword(false);
    setForgotPasswordStep(1);
    setForgotEmail('');
    setOtp('');
  };

  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true);
    setForgotPasswordStep(1);
    setForgotEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setOtpTimer(0);
    setCanResendOtp(false);
    setForgotPasswordError('');
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setForgotPasswordStep(1);
    setForgotEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotPasswordError('');
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setStatusMessage('Sending OTP...');
    setForgotPasswordError('');
    
    try {
      // Call API to send OTP
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotEmail })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMessage('');
        setForgotPasswordStep(2);
        setOtpTimer(data.resendOtpSeconds || 60);
        setCanResendOtp(false);
        setForgotPasswordError('');
      } else {
        setStatusMessage('');
        setForgotPasswordError(data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setStatusMessage('');
      setForgotPasswordError('Failed to send OTP. Please check your connection and try again.');
    }
  };

  const handleResendOtp = async () => {
    setStatusMessage('Resending OTP...');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotEmail })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setOtpTimer(data.resendOtpSeconds || 60);
        setCanResendOtp(false);
        setStatusMessage('');
        setForgotPasswordError('OTP resent to your email!');
        setTimeout(() => setForgotPasswordError(''), 3000);
      } else {
        setStatusMessage('');
        setForgotPasswordError(data.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      setStatusMessage('');
      setForgotPasswordError('Failed to resend OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setStatusMessage('Verifying OTP...');
    
    try {
      // Call API to verify OTP
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: forgotEmail,
          otp: otp 
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMessage('');
        setForgotPasswordStep(3);
        setForgotPasswordError('');
      } else {
        setStatusMessage('');
        setForgotPasswordError(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setStatusMessage('');
      setForgotPasswordError('Failed to verify OTP. Please try again.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setForgotPasswordError('Passwords do not match!');
      return;
    }

    if (newPassword.length < 6) {
      setForgotPasswordError('Password must be at least 6 characters long!');
      return;
    }

    setStatusMessage('Changing password...');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: forgotEmail,
          otp: otp,
          newPassword: newPassword
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMessage('Password changed successfully!');
        setTimeout(() => {
          setStatusMessage('');
          handleBackToLogin();
        }, 2000);
      } else {
        setStatusMessage('');
        setForgotPasswordError(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setStatusMessage('');
      setForgotPasswordError('Failed to reset password. Please try again.');
    }
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
                alert(' Request Already Submitted\n\n' + data.message);
              } else if (data.status === 'already_exists') {
                alert('Account Already Exists\n\n' + data.message);
                // Optionally switch to login view
                setTimeout(() => setIsLogin(true), 2000);
              } else if (data.status === 'rejected') {
                setRejectedMessage(data.message);
                setShowRejectedPopup(true);
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
      {statusMessage && <StatusMessage message={statusMessage} />}
      <Popup
        isOpen={showRejectedPopup}
        onClose={() => setShowRejectedPopup(false)}
        onConfirm={() => setShowRejectedPopup(false)}
        title="Previous Request Rejected"
        message={rejectedMessage || "Your previous registration request was rejected by admin."}
        type="danger"
        confirmText="OK"
        cancelText=""
      />
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

            {showForgotPassword ? (
              // --- FORGOT PASSWORD FORM ---
              <form onSubmit={forgotPasswordStep === 1 ? handleSendOtp : forgotPasswordStep === 2 ? handleVerifyOtp : handleResetPassword}>
                {forgotPasswordStep === 1 ? (
                  // Step 1: Enter Email
                  <div className="input-group">
                    <label htmlFor="forgotEmail">Email Address <span className="required">*</span></label>
                    <input
                      type="email"
                      id="forgotEmail"
                      name="forgotEmail"
                      placeholder="Enter your registered email"
                      value={forgotEmail}
                      onChange={(e) => {
                        setForgotEmail(e.target.value);
                        setForgotPasswordError('');
                      }}
                      required
                    />
                    {forgotPasswordError && (
                      <p style={{ color: 'red', fontSize: '14px', marginTop: '8px', marginBottom: '0' }}>
                        {forgotPasswordError}
                      </p>
                    )}
                  </div>
                ) : forgotPasswordStep === 2 ? (
                  // Step 2: Enter OTP
                  <>
                    <div className="input-group">
                      <label htmlFor="otp">Enter OTP <span className="required">*</span></label>
                      <input
                        type="text"
                        id="otp"
                        name="otp"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength="6"
                        required
                      />
                    </div>
                    <div className="otp-timer-container">
                      {canResendOtp ? (
                        <button type="button" className="resend-otp-btn" onClick={handleResendOtp}>
                          Resend OTP
                        </button>
                      ) : (
                        <p className="otp-timer">Resend OTP in {otpTimer}s</p>
                      )}
                    </div>
                  </>
                ) : (
                  // Step 3: Enter New Password
                  <>
                    <div className="input-group password-group">
                      <label htmlFor="newPassword">New Password <span className="required">*</span></label>
                      <div className="password-input-wrapper">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          id="newPassword"
                          name="newPassword"
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          minLength="6"
                          required
                        />
                        <button
                          type="button"
                          className="eye-toggle"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          tabIndex="-1"
                          aria-label={showNewPassword ? "Hide password" : "Show password"}
                        >
                          {showNewPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                        </button>
                      </div>
                    </div>

                    <div className="input-group password-group">
                      <label htmlFor="confirmPassword">Confirm Password <span className="required">*</span></label>
                      <div className="password-input-wrapper">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="confirmPassword"
                          name="confirmPassword"
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          minLength="6"
                          required
                        />
                        <button
                          type="button"
                          className="eye-toggle"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          tabIndex="-1"
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Submit Button */}
                <button type="submit" className="main-btn">
                  {forgotPasswordStep === 1 ? 'Send OTP' : forgotPasswordStep === 2 ? 'Verify OTP' : 'Reset Password'}
                </button>

                {/* Back to Login */}
                <div className="back-to-login-container">
                  <button type="button" className="link-btn" onClick={handleBackToLogin}>
                    Back to Login
                  </button>
                </div>
              </form>
            ) : (
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
            )}

            {/* Forget Password Link - Only for Login */}
            {isLogin && !showForgotPassword && (
              <div className="forget-password-container">
                <button type="button" className="link-btn" onClick={handleForgotPasswordClick}>
                  Forget password ?
                </button>
              </div>
            )}

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
