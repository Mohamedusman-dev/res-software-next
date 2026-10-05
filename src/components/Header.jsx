import React from 'react';
import {
  ChefHat,
  WalletCards,
  Search,
  Bell,
  Settings,
  LogOut
} from 'lucide-react';

export default function Header({
  searchTerm,
  setSearchTerm,
  onOpenSettings,
  currentUser,
  onOpenLogin,
  onLogout
}) {
  const cashierName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Ravi';
  const avatarSrc = currentUser?.avatar || '/food/avatar.jpg';

  return (
    <header className="pos-header">
      {/* Left Title: Restaurant POS */}
      <div className="header-left">
        <div className="pos-title-badge">
          <ChefHat size={22} className="chef-hat-icon" />
          <span className="pos-system-title">Restaurant POS</span>
        </div>

        {/* Center-Left: Station Indicator */}
        <div className="station-indicator">
          <div className="station-icon-box">
            <WalletCards size={20} color="#5025d1" />
          </div>
          <div className="station-text">
            <h2 className="station-title">Cashier</h2>
            <p className="station-subtitle">Take orders & process billing</p>
          </div>
        </div>
      </div>

      {/* Right Actions & Cashier Profile */}
      <div className="header-right">
        {/* Global Menu Search */}
        <div className="header-search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search menu item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="header-search-input"
          />
        </div>

        {/* Notification Bell */}
        <button className="header-icon-btn" title="Notifications">
          <Bell size={20} />
          <span className="notification-badge-dot"></span>
        </button>

        {/* Settings Button */}
        <button
          className="header-icon-btn"
          title="POS Settings"
          onClick={onOpenSettings}
        >
          <Settings size={20} />
        </button>

        {/* Cashier Profile */}
        <div
          className="cashier-profile-pill"
          onClick={onOpenLogin}
          title="Switch Cashier"
          style={{ cursor: 'pointer' }}
        >
          <img
            src={avatarSrc}
            alt={cashierName}
            className="cashier-avatar-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/mr-mango-logo.png';
            }}
          />
          <div className="cashier-info">
            <span className="cashier-label">Cashier</span>
            <span className="cashier-name">{cashierName}</span>
          </div>
        </div>

        {/* Logout Button */}
        {onLogout && (
          <button
            className="header-logout-btn"
            onClick={onLogout}
            title="Log Out from POS"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </header>
  );
}
