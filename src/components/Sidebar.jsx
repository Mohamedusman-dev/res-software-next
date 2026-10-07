import React from 'react';
import {
  WalletCards,
  Armchair,
  ChefHat,
  BarChart3,
  Settings,
  Power,
  ClipboardList,
  UtensilsCrossed,
  LayoutGrid,
  ShoppingBag,
  Truck,
  Activity,
  History,
  Receipt
} from 'lucide-react';

export default function Sidebar({ activeNav, setActiveNav, currentUser, onLogout }) {
  // Role-based Nav items filtering
  const isWaiter = currentUser?.role === 'waiter';

  const cashierNavItems = [
    { id: 'cashier', label: 'Take Away', icon: WalletCards },
    { id: 'pending', label: 'Pending Bills', icon: ClipboardList },
    { id: 'menu', label: 'Menu Management', icon: UtensilsCrossed },
    { id: 'tables', label: 'Table Management', icon: Armchair },
    { id: 'kitchen', label: 'KOT / Kitchen', icon: ChefHat },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Exact Waiter sidebar items from user reference image
  const waiterNavItems = [
    { id: 'waiter_food_order', label: 'Food Order', icon: UtensilsCrossed },
    { id: 'waiter_tables', label: 'Table Status', icon: LayoutGrid },
    { id: 'waiter_takeaway', label: 'Takeaway', icon: ShoppingBag },
    { id: 'waiter_delivery', label: 'Delivery', icon: Truck },
    { id: 'waiter_kitchen', label: 'Kitchen Status', icon: Activity },
    { id: 'waiter_history', label: 'Order History', icon: History },
    { id: 'waiter_bills', label: 'Bills', icon: Receipt },
    { id: 'waiter_settings', label: 'Settings', icon: Settings },
  ];

  const navItems = isWaiter ? waiterNavItems : cashierNavItems;

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      alert('Logged out successfully');
    }
  };

  return (
    <aside className="pos-sidebar">
      {/* Brand & Mascot */}
      <div className="sidebar-brand">
        <div className="brand-logo-container">
          <img
            src="https://ik.imagekit.io/aq2gvjkip/food/mr-mango-logo.png"
            alt="Mr. Mango Logo"
            className="brand-logo-img"
          />
        </div>
        <div className="brand-text">
          <span className="brand-name">Mr. Mango</span>
          <span className="brand-tagline">
            {isWaiter ? 'WAITER TERMINAL' : 'RESTAURANT POS'}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          // Normalize active tab check for waiter tabs or default
          const isActive =
            activeNav === item.id ||
            (isWaiter && activeNav === 'waiter' && item.id === 'waiter_food_order');
          return (
            <button
              key={item.id}
              className={`nav-item-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              <span className="nav-icon-wrapper">
                <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
              </span>
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Section: Promo Card + Logout & Version */}
      <div className="sidebar-bottom-section">
        <div className="sidebar-promo-card">
          <div className="promo-text-content">
            <h4 className="promo-white-title">Good Food</h4>
            <h3 className="promo-yellow-script">Better Mood</h3>
            <div className="promo-yellow-bar"></div>
          </div>

          {/* Food Illustration in Card */}
          <div className="promo-dish-wrapper">
            <img
              src="https://ik.imagekit.io/aq2gvjkip/food/promo-dish.jpg?updatedAt=1791301143726"
              alt="Delicious Meal"
              className="promo-dish-img"
            />
          </div>
        </div>

        {/* Logout and Version Row */}
        <div className="sidebar-footer-row">
          <button className="sidebar-logout-btn" onClick={handleLogoutClick} title="Logout">
            <Power size={17} className="logout-icon" />
            <span>Logout</span>
          </button>
          <span className="sidebar-version-tag">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
