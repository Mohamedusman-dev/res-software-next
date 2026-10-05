import React, { useState } from 'react';
import {
  KeyRound,
  X,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export const DUMMY_USERS = [
  {
    id: 'cashier_priya',
    name: 'Priya (Cashier)',
    role: 'cashier',
    roleLabel: 'Billing Cashier',
    pin: '1234',
    avatar: '/food/avatar.jpg',
    color: '#5025d1',
    badgeBg: '#f5f3ff',
    defaultTab: 'cashier'
  },
  {
    id: 'waiter_raju',
    name: 'Raju (Waiter 1)',
    role: 'waiter',
    roleLabel: 'Table Captain / Waiter',
    pin: '1234',
    avatar: '/food/avatar.jpg',
    color: '#059669',
    badgeBg: '#ecfdf5',
    defaultTab: 'waiter'
  },
  {
    id: 'waiter_karthik',
    name: 'Karthik (Waiter 2)',
    role: 'waiter',
    roleLabel: 'Floor Waiter',
    pin: '1234',
    avatar: '/food/avatar.jpg',
    color: '#0d9488',
    badgeBg: '#f0fdfa',
    defaultTab: 'waiter'
  },
  {
    id: 'admin_ramesh',
    name: 'Ramesh (Manager)',
    role: 'admin',
    roleLabel: 'Store Admin / Manager',
    pin: '9999',
    avatar: '/food/avatar.jpg',
    color: '#d97706',
    badgeBg: '#fffbeb',
    defaultTab: 'cashier'
  }
];

export default function LoginModal({
  isOpen,
  onClose,
  currentUser,
  onLoginUser
}) {
  const [selectedUser, setSelectedUser] = useState(currentUser || DUMMY_USERS[0]);
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setPinInput('');
    setErrorMsg('');
  };

  const handleKeypadPress = (val) => {
    if (pinInput.length < 4) {
      const nextPin = pinInput + val;
      setPinInput(nextPin);
      setErrorMsg('');
      if (nextPin.length === 4) {
        verifyAndLogin(nextPin, selectedUser);
      }
    }
  };

  const handleBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const verifyAndLogin = (pinToTest, userToLogin = selectedUser) => {
    if (pinToTest === userToLogin.pin || pinToTest === '1234') {
      onLoginUser(userToLogin);
      onClose();
    } else {
      setErrorMsg(`Incorrect PIN. (Hint: ${userToLogin.pin} or 1-Click)`);
    }
  };

  const handleQuickLogin = (user) => {
    onLoginUser(user);
    onClose();
  };

  return (
    <div className="pos-modal-overlay">
      <div className="pos-modal-card login-modal-card">
        {/* Header */}
        <div className="login-modal-header">
          <div className="login-header-title-box">
            <div className="login-badge-icon">
              <KeyRound size={22} color="#5025d1" />
            </div>
            <div>
              <h2 className="login-title">Staff Switch & Login</h2>
              <p className="login-subtitle">
                Select staff profile or enter 4-digit PIN for Waiter / Cashier access
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="login-modal-body">
          {/* Left Side: Staff Profiles List */}
          <div className="login-staff-list">
            <span className="login-section-label">Select Staff Profile:</span>
            {DUMMY_USERS.map((user) => {
              const isSelected = selectedUser.id === user.id;
              const isCurrentlyActive = currentUser?.id === user.id;

              return (
                <div
                  key={user.id}
                  className={`login-staff-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectUser(user)}
                >
                  <div className="staff-card-avatar-wrap">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="staff-card-avatar"
                    />
                    {isCurrentlyActive && (
                      <span className="staff-active-indicator" title="Currently Active"></span>
                    )}
                  </div>

                  <div className="staff-card-info">
                    <div className="staff-card-name-row">
                      <h4 className="staff-card-name">{user.name}</h4>
                      {isCurrentlyActive && (
                        <span className="staff-active-pill">Logged In</span>
                      )}
                    </div>
                    <span
                      className="staff-card-role-tag"
                      style={{ color: user.color, backgroundColor: user.badgeBg }}
                    >
                      {user.roleLabel}
                    </span>
                  </div>

                  <button
                    className="staff-quick-login-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickLogin(user);
                    }}
                    title="1-Click Direct Login"
                  >
                    <span>Instant In</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Right Side: PIN Entry & Keypad */}
          <div className="login-pin-section">
            <div className="pin-profile-preview">
              <img
                src={selectedUser.avatar}
                alt={selectedUser.name}
                className="pin-avatar-large"
              />
              <h3 className="pin-user-name">{selectedUser.name}</h3>
              <span
                className="pin-user-role-badge"
                style={{
                  color: selectedUser.color,
                  backgroundColor: selectedUser.badgeBg
                }}
              >
                {selectedUser.roleLabel}
              </span>
            </div>

            {/* PIN Dots Display */}
            <div className="pin-display-container">
              <div className="pin-dots-row">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`pin-dot ${idx < pinInput.length ? 'filled' : ''}`}
                  />
                ))}
              </div>
              <span className="pin-hint-text">
                PIN: <strong>{selectedUser.pin}</strong>
              </span>
              {errorMsg && <p className="pin-error-text">{errorMsg}</p>}
            </div>

            {/* Numeric Keypad */}
            <div className="pin-keypad-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  className="pin-key-btn"
                  onClick={() => handleKeypadPress(num.toString())}
                >
                  {num}
                </button>
              ))}
              <button
                className="pin-key-btn pin-clear-btn"
                onClick={() => {
                  setPinInput('');
                  setErrorMsg('');
                }}
              >
                C
              </button>
              <button
                className="pin-key-btn"
                onClick={() => handleKeypadPress('0')}
              >
                0
              </button>
              <button
                className="pin-key-btn pin-backspace-btn"
                onClick={handleBackspace}
              >
                ⌫
              </button>
            </div>

            {/* Direct Login Button */}
            <button
              className="pin-direct-login-btn"
              onClick={() => handleQuickLogin(selectedUser)}
            >
              <CheckCircle2 size={18} />
              <span>Login as {selectedUser.name.split(' ')[0]}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
