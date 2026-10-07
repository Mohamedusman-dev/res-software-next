import React, { useState } from 'react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  HelpCircle,
  Minus,
  Square,
  X,
  Check,
  WalletCards,
  UserCheck
} from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('cashier');
  const [password, setPassword] = useState('1234');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const performLogin = (userToTest, passToTest) => {
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const cleanUser = userToTest.trim().toLowerCase();

      if (cleanUser === 'waiter' || cleanUser.includes('waiter') || cleanUser === 'raju') {
        if (passToTest === '1234' || passToTest === 'waiter123') {
          const userObj = {
            id: 'waiter_raju',
            name: 'Raju (Waiter)',
            role: 'waiter',
            roleLabel: 'Table Captain / Waiter',
            avatar: '/food/avatar.jpg',
            defaultTab: 'waiter'
          };
          onLoginSuccess(userObj);
        } else {
          setErrorMsg('Invalid password for Waiter. (Use password: 1234)');
          setIsLoading(false);
        }
      } else if (cleanUser === 'cashier' || cleanUser.includes('cashier') || cleanUser === 'admin' || cleanUser === 'ravi') {
        if (passToTest === '1234' || passToTest === 'cashier123') {
          const userObj = {
            id: 'cashier_priya',
            name: 'Ravi (Cashier)',
            role: 'cashier',
            roleLabel: 'Billing Cashier',
            avatar: '/food/avatar.jpg',
            defaultTab: 'cashier'
          };
          onLoginSuccess(userObj);
        } else {
          setErrorMsg('Invalid password for Cashier. (Use password: 1234)');
          setIsLoading(false);
        }
      } else {
        // Default login as Cashier for smooth testing
        const userObj = {
          id: 'cashier_custom',
          name: userToTest,
          role: 'cashier',
          roleLabel: 'Billing Cashier',
          avatar: '/food/avatar.jpg',
          defaultTab: 'cashier'
        };
        onLoginSuccess(userObj);
      }
    }, 300);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both username and password.');
      return;
    }
    performLogin(username, password);
  };

  const handleQuickCashierLogin = () => {
    setUsername('cashier');
    setPassword('1234');
    performLogin('cashier', '1234');
  };

  const handleQuickWaiterLogin = () => {
    setUsername('waiter');
    setPassword('1234');
    performLogin('waiter', '1234');
  };

  return (
    <div className="login-screen-root">
      {/* 1. App Window Title Bar */}
      <div className="login-window-bar">
        <div className="login-window-left">
          <img src="https://ik.imagekit.io/aq2gvjkip/food/mr-mango-logo.png" alt="Mr. Mango" style={{ height: '24px', objectFit: 'contain' }} />
        </div>

        <div className="login-window-controls">
          <button className="win-ctrl-btn" title="Minimize">
            <Minus size={13} />
          </button>
          <button className="win-ctrl-btn" title="Maximize">
            <Square size={11} />
          </button>
          <button className="win-ctrl-btn close" title="Close">
            <X size={13} />
          </button>
        </div>
      </div>

      {/* 2. Main Login Canvas */}
      <div className="login-canvas-body">
        {/* Background Decorative Elements */}
        <div className="login-bg-blob blob-top-left"></div>
        <div className="login-bg-blob blob-bottom-right"></div>
        <div className="login-dots-pattern dots-1"></div>
        <div className="login-dots-pattern dots-2"></div>
        <div className="login-leaf-accent leaf-1">🍃</div>
        <div className="login-leaf-accent leaf-2">🌱</div>

        {/* Left Hero Section: Branding + Food Platter */}
        <div className="login-hero-section">
          {/* Logo & Tagline */}
          <div className="login-brand-header">
            <img
              src="https://ik.imagekit.io/aq2gvjkip/food/mr-mango-logo.png"
              alt="Mr. Mango Logo"
              className="mr-mango-login-logo-hero"
            />
            <h1 className="login-brand-title">Mr. Mango</h1>
            <span className="login-brand-subtitle">RESTAURANT POS</span>
            <p className="login-brand-tagline">
              Good Food &nbsp;•&nbsp; Happy People &nbsp;•&nbsp; Better Together
            </p>
          </div>

          {/* Steaming Food Feast Image Platter */}
          <div className="login-food-feast-wrapper">
            <div className="food-shadow-backdrop"></div>
            <img
              src="https://ik.imagekit.io/dnwxwfayw/Screenshot_2026-09-28_164410-removebg-preview.png"
              alt="TastyBite Royal Feast"
              className="login-food-feast-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://ik.imagekit.io/dnwxwfayw/Screenshot_2026-09-28_164410-removebg-preview.png';
              }}
            />
          </div>
        </div>

        {/* Right Floating Card: Login Form */}
        <div className="login-card-section">
          <div className="login-white-card">
            {/* Card Logo Header */}
            <div className="card-brand-header">
              <img
                src="https://ik.imagekit.io/aq2gvjkip/food/mr-mango-logo.png"
                alt="Mr. Mango Logo"
                className="mr-mango-login-logo-card"
              />
              <h2 className="card-brand-name">Mr. Mango</h2>
              <span className="card-brand-sub">RESTAURANT POS</span>
              <div className="card-yellow-underline"></div>
            </div>

            {/* Welcome Text */}
            <div className="card-welcome-box">
              <h3 className="welcome-title">Welcome Back</h3>
              <p className="welcome-sub">Sign in to manage your restaurant terminal</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleFormSubmit} className="login-form-inner">
              {/* Username Input */}
              <div className="login-input-field">
                <div className="input-icon-box">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Username / Email"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrorMsg('');
                  }}
                  autoFocus
                  required
                />
              </div>

              {/* Password Input */}
              <div className="login-input-field">
                <div className="input-icon-box">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg('');
                  }}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Error Message */}
              {errorMsg && <div className="login-error-badge">{errorMsg}</div>}

              {/* Remember Me & Forgot Password Row */}
              <div className="login-options-row">
                <label className="remember-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="custom-check-box">
                    {rememberMe && <Check size={13} strokeWidth={3} />}
                  </span>
                  <span className="remember-text">Remember me</span>
                </label>

                <button
                  type="button"
                  className="forgot-pass-btn"
                  onClick={() =>
                    alert('Logins:\n• Cashier: username="cashier", password="1234"\n• Waiter: username="waiter", password="1234"')
                  }
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="login-submit-btn"
                disabled={isLoading}
              >
                <LogIn size={20} />
                <span>{isLoading ? 'Signing In...' : 'Login'}</span>
              </button>

              {/* Seperate Role Login Buttons */}
              <div className="role-quick-logins">
                <span className="role-login-label">Quick Terminal Login:</span>
                <div className="role-login-grid">
                  <button
                    type="button"
                    className="role-login-btn cashier"
                    onClick={handleQuickCashierLogin}
                  >
                    <WalletCards size={16} />
                    <span>Login as Cashier</span>
                  </button>
                  <button
                    type="button"
                    className="role-login-btn waiter"
                    onClick={handleQuickWaiterLogin}
                  >
                    <UserCheck size={16} />
                    <span>Login as Waiter</span>
                  </button>
                </div>
              </div>

              {/* Footer Help */}
              <div className="login-card-footer">
                <div className="help-divider-line"></div>
                <button
                  type="button"
                  className="need-help-link"
                  onClick={() =>
                    alert(
                      'TastyBite POS Login Instructions:\n\n1. Cashier Terminal:\n   Username: cashier\n   Password: 1234\n\n2. Waiter Order Terminal:\n   Username: waiter\n   Password: 1234'
                    )
                  }
                >
                  <HelpCircle size={15} />
                  <span>Need help?</span>
                </button>
                <div className="help-divider-line"></div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
