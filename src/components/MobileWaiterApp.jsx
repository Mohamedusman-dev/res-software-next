import React, { useState } from 'react';
import {
  ChefHat,
  Search,
  Filter,
  Home,
  Armchair,
  ShoppingCart,
  Receipt,
  User,
  Plus,
  Utensils,
  Clock,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Flame,
  ArrowLeft,
  ArrowRightLeft,
  Link,
  UserPlus,
  LogOut,
  X,
  FileText,
  CreditCard,
  MoreHorizontal
} from 'lucide-react';
import { CATEGORIES } from '../data/menuData';
import { broadcastLiveEvent } from '../lib/supabase';

// Waiter Tables Data
const INITIAL_TABLES = [
  { id: 'A1', name: 'Table A1', guests: 2, capacity: 4, status: 'Occupied', itemsCount: 2, amount: 250 },
  { id: 'A2', name: 'Table A2', guests: 4, capacity: 4, status: 'Occupied', itemsCount: 3, amount: 480 },
  { id: 'A3', name: 'Table A3', guests: 0, capacity: 4, status: 'Available', itemsCount: 0, amount: 0 },
  { id: 'A4', name: 'Table A4', guests: 0, capacity: 4, status: 'Available', itemsCount: 0, amount: 0 },
  { id: 'B1', name: 'Table B1', guests: 3, capacity: 4, status: 'Occupied', itemsCount: 4, amount: 620 },
  { id: 'B2', name: 'Table B2', guests: 0, capacity: 4, status: 'Available', itemsCount: 0, amount: 0 },
  { id: 'B3', name: 'Table B3', guests: 0, capacity: 4, status: 'Available', itemsCount: 0, amount: 0 },
  { id: 'B4', name: 'Table B4', guests: 0, capacity: 4, status: 'Available', itemsCount: 0, amount: 0 },
  { id: 'C1', name: 'Table C1', guests: 4, capacity: 6, status: 'Occupied', itemsCount: 5, amount: 950 },
  { id: 'C2', name: 'Table C2', guests: 0, capacity: 4, status: 'Available', itemsCount: 0, amount: 0 },
  { id: 'C3', name: 'Table C3', guests: 0, capacity: 4, status: 'Available', itemsCount: 0, amount: 0 },
  { id: 'C4', name: 'Table C4', guests: 0, capacity: 4, status: 'Available', itemsCount: 0, amount: 0 },
  { id: 'D1', name: 'Table D1', guests: 2, capacity: 4, status: 'Occupied', itemsCount: 2, amount: 310 },
  { id: 'D2', name: 'Table D2', guests: 0, capacity: 4, status: 'Available', itemsCount: 0, amount: 0 },
  { id: 'D3', name: 'Table D3', guests: 0, capacity: 4, status: 'Available', itemsCount: 0, amount: 0 },
  { id: 'D4', name: 'Table D4', guests: 0, capacity: 4, status: 'Available', itemsCount: 0, amount: 0 }
];

const RECENT_ORDERS_DATA = [
  {
    id: 'ORD-101',
    table: 'A1',
    guests: 2,
    time: '12:32 PM',
    status: 'Preparing',
    itemsSummary: 'Chicken Biryani x1, Veg Fried Rice x1',
    total: 430
  },
  {
    id: 'ORD-102',
    table: 'B1',
    guests: 3,
    time: '12:45 PM',
    status: 'Ready to Serve',
    itemsSummary: 'Paneer Butter Masala x1, Butter Naan x4',
    total: 380
  },
  {
    id: 'ORD-103',
    table: 'C1',
    guests: 4,
    time: '01:10 PM',
    status: 'Preparing',
    itemsSummary: 'Mutton Biryani x2, Fresh Mango Lassi x4',
    total: 1000
  }
];

export default function MobileWaiterApp({
  menuItems,
  currentUser,
  onLogout,
  onOpenLogin
}) {
  const [activeBottomTab, setActiveBottomTab] = useState('home'); // 'home', 'tables', 'orders', 'bills', 'profile'
  const [tableFilter, setTableFilter] = useState('all'); // 'all', 'occupied', 'available'
  const [selectedTable, setSelectedTable] = useState(INITIAL_TABLES[0]);
  const [tablesList, setTablesList] = useState(INITIAL_TABLES);

  // Food Order State inside Waiter Panel
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCart, setCurrentCart] = useState([]);
  const [kotTicketModal, setKotTicketModal] = useState(null);
  const [guestCount, setGuestCount] = useState(2);

  // Custom Item Popup State
  const [isCustomItemOpen, setIsCustomItemOpen] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');
  const [customItemCategory, setCustomItemCategory] = useState('starters');

  // Cart operations
  const handleAddToCart = (dish) => {
    setCurrentCart((prev) => {
      const existing = prev.find((i) => i.id === dish.id);
      if (existing) {
        return prev.map((i) =>
          i.id === dish.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: dish.id,
          name: dish.name,
          price: dish.price,
          quantity: 1,
          notes: []
        }
      ];
    });
  };

  const handleAddCustomItem = (e) => {
    e.preventDefault();
    if (!customItemName.trim() || !customItemPrice || isNaN(parseFloat(customItemPrice))) return;
    const newDish = {
      id: 'custom-' + Date.now(),
      name: customItemName.trim(),
      price: parseFloat(customItemPrice),
      category: customItemCategory,
      image: '/mr-mango-logo.png',
      hasStar: false
    };
    handleAddToCart(newDish);
    setCustomItemName('');
    setCustomItemPrice('');
    setIsCustomItemOpen(false);
  };

  // Punch KOT
  const handlePunchKOT = () => {
    if (currentCart.length === 0) return;

    const subtotal = currentCart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const kotNo = 'KOT-' + Math.floor(1000 + Math.random() * 9000);
    const kotPayload = {
      kotNo,
      table: selectedTable.id,
      tableObj: selectedTable,
      waiter: currentUser?.name || 'Ravi Kumar',
      guests: guestCount,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items: [...currentCart],
      totalAmount: subtotal
    };

    setKotTicketModal(kotPayload);

    // Update table status to occupied
    setTablesList((prev) =>
      prev.map((t) =>
        t.id === selectedTable.id
          ? { ...t, status: 'Occupied', guests: guestCount, itemsCount: currentCart.length, amount: subtotal }
          : t
      )
    );

    // Broadcast live event via Supabase & Realtime channel
    broadcastLiveEvent('KOT_PUNCHED', kotPayload);
  };

  const handleFinishKOTModal = () => {
    setKotTicketModal(null);
    setCurrentCart([]);
    setActiveBottomTab('tables');
  };

  // Filtered Menu Items
  const filteredDishes = menuItems.filter((d) => {
    const matchCat = selectedCategory === 'all' || d.category === selectedCategory;
    const matchSearch =
      !searchQuery.trim() ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Filtered Tables
  const filteredTables = tablesList.filter((t) => {
    if (tableFilter === 'occupied') return t.status === 'Occupied';
    if (tableFilter === 'available') return t.status === 'Available';
    return true;
  });

  const occupiedCount = tablesList.filter((t) => t.status === 'Occupied').length;
  const availableCount = tablesList.filter((t) => t.status === 'Available').length;
  const cartSubtotal = currentCart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalCartQty = currentCart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="mobile-waiter-root">
      {/* Phone Screen Frame Container */}
      <div className="mobile-phone-frame">
        {/* Mobile Header Bar */}
        <div className="m-header-bar">
          <div className="m-header-left">
            {activeBottomTab !== 'home' && (
              <button
                className="m-back-btn"
                onClick={() => setActiveBottomTab('home')}
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div className="m-brand-logo-box">
              <ChefHat size={22} color="#160e44" strokeWidth={2.4} />
            </div>
            <div>
              <h2 className="m-brand-name">TastyBite</h2>
              <span className="m-brand-sub">RESTAURANT POS</span>
            </div>
          </div>

          <div className="m-header-right">
            <div className="m-waiter-pill" onClick={onOpenLogin} title="Switch User">
              <img
                src={currentUser?.avatar || '/food/avatar.jpg'}
                alt={currentUser?.name}
                className="m-waiter-avatar"
              />
              <div className="m-waiter-meta">
                <span className="m-waiter-name">
                  {currentUser?.name ? currentUser.name.split(' ')[0] : 'Ravi'}
                </span>
                <span className="m-waiter-role">Waiter</span>
              </div>
              <ChevronDown size={14} color="#64748b" />
            </div>
            <button
              className="m-logout-btn"
              onClick={onLogout}
              title="Log Out from POS"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* ====================================================================
           TAB 1: HOME DASHBOARD (Exact Left Screen in Reference Image)
           ==================================================================== */}
        {activeBottomTab === 'home' && (
          <div className="m-tab-content m-home-tab">
            {/* Greeting Header */}
            <div className="m-greeting-card">
              <div className="m-greeting-left">
                <div className="m-waiter-illustration-circle">
                  <span className="waiter-emoji">👨‍🍳</span>
                </div>
                <div>
                  <span className="m-greeting-sub">Good Morning,</span>
                  <h3 className="m-greeting-name">
                    {currentUser?.name || 'Ravi Kumar'}
                  </h3>
                  <p className="m-greeting-hint">Here's your today's overview</p>
                </div>
              </div>
              <span className="m-bell-badge-icon">📣</span>
            </div>

            {/* Overview 4 KPI Cards */}
            <div className="m-kpi-grid">
              {/* Card 1: Active Tables */}
              <div
                className="m-kpi-card purple"
                onClick={() => setActiveBottomTab('tables')}
              >
                <div className="kpi-icon-row">
                  <div className="kpi-icon-box purple">
                    <Armchair size={16} />
                  </div>
                </div>
                <span className="kpi-title">Active Tables</span>
                <div className="kpi-val-row">
                  <strong className="kpi-val">{occupiedCount}</strong>
                  <span className="kpi-total">/{tablesList.length}</span>
                </div>
                <div className="kpi-arrow-circle purple">
                  <ChevronRight size={12} />
                </div>
              </div>

              {/* Card 2: Pending Orders */}
              <div
                className="m-kpi-card yellow"
                onClick={() => setActiveBottomTab('orders')}
              >
                <div className="kpi-icon-row">
                  <div className="kpi-icon-box yellow">
                    <Clock size={16} />
                  </div>
                </div>
                <span className="kpi-title">Pending Orders</span>
                <strong className="kpi-val">3</strong>
                <div className="kpi-arrow-circle yellow">
                  <ChevronRight size={12} />
                </div>
              </div>

              {/* Card 3: Ready to Serve */}
              <div
                className="m-kpi-card green"
                onClick={() => setActiveBottomTab('tables')}
              >
                <div className="kpi-icon-row">
                  <div className="kpi-icon-box green">
                    <ChefHat size={16} />
                  </div>
                </div>
                <span className="kpi-title">Ready to Serve</span>
                <strong className="kpi-val">2</strong>
                <div className="kpi-arrow-circle green">
                  <ChevronRight size={12} />
                </div>
              </div>

              {/* Card 4: Served Today */}
              <div className="m-kpi-card blue">
                <div className="kpi-icon-row">
                  <div className="kpi-icon-box blue">
                    <CheckCircle2 size={16} />
                  </div>
                </div>
                <span className="kpi-title">Served Today</span>
                <strong className="kpi-val">8</strong>
                <div className="kpi-arrow-circle blue">
                  <ChevronRight size={12} />
                </div>
              </div>
            </div>

            {/* Promo Biryani Banner */}
            <div className="m-promo-banner-card">
              <div className="m-promo-img-wrap">
                <img src="/food/login-feast.jpg" alt="Great Food" />
              </div>
              <div className="m-promo-text">
                <h4>Great Food</h4>
                <h3>Happy People</h3>
                <span>Better Together</span>
              </div>
            </div>

            {/* Quick Actions (4x2 Grid) */}
            <div className="m-section-header">
              <h3 className="m-section-title">Quick Actions</h3>
            </div>
            <div className="m-actions-8grid">
              <div
                className="m-action-item"
                onClick={() => setActiveBottomTab('orders')}
              >
                <div className="action-icon-box purple">
                  <Utensils size={20} />
                </div>
                <span className="action-label">Take Order</span>
              </div>

              <div
                className="m-action-item"
                onClick={() => setActiveBottomTab('tables')}
              >
                <div className="action-icon-box purple">
                  <Armchair size={20} />
                </div>
                <span className="action-label">Table Mgmt</span>
              </div>

              <div
                className="m-action-item"
                onClick={() => setActiveBottomTab('orders')}
              >
                <div className="action-icon-box purple">
                  <ChefHat size={20} />
                </div>
                <span className="action-label">View KOT</span>
              </div>

              <div className="m-action-item">
                <div className="action-icon-box purple">
                  <FileText size={20} />
                </div>
                <span className="action-label">Order Status</span>
              </div>

              <div
                className="m-action-item"
                onClick={() => setActiveBottomTab('bills')}
              >
                <div className="action-icon-box purple">
                  <Receipt size={20} />
                </div>
                <span className="action-label">Current Bills</span>
              </div>

              <div
                className="m-action-item"
                onClick={() => setActiveBottomTab('bills')}
              >
                <div className="action-icon-box purple">
                  <FileText size={20} />
                </div>
                <span className="action-label">Request Bill</span>
              </div>

              <div
                className="m-action-item"
                onClick={() => setActiveBottomTab('bills')}
              >
                <div className="action-icon-box purple">
                  <CreditCard size={20} />
                </div>
                <span className="action-label">Payment</span>
              </div>

              <div className="m-action-item">
                <div className="action-icon-box purple">
                  <MoreHorizontal size={20} />
                </div>
                <span className="action-label">More</span>
              </div>
            </div>

            {/* Recent Orders List */}
            <div className="m-section-header">
              <h3 className="m-section-title">Recent Orders</h3>
              <button
                className="m-view-all-btn"
                onClick={() => setActiveBottomTab('orders')}
              >
                View All
              </button>
            </div>

            <div className="m-recent-orders-list">
              {RECENT_ORDERS_DATA.map((ord) => (
                <div
                  key={ord.id}
                  className="m-order-recent-card"
                  onClick={() => {
                    const tableObj = tablesList.find((t) => t.id === ord.table);
                    if (tableObj) setSelectedTable(tableObj);
                    setActiveBottomTab('orders');
                  }}
                >
                  <div className="recent-card-left">
                    <div className="recent-table-badge">{ord.table}</div>
                    <div>
                      <div className="recent-table-name">
                        Table {ord.table}
                      </div>
                      <span className="recent-meta-text">
                        👥 {ord.guests} Guests • {ord.time}
                      </span>
                    </div>
                  </div>

                  <div className="recent-card-right">
                    <span
                      className={`recent-status-pill ${ord.status
                        .toLowerCase()
                        .replace(/\s+/g, '-')}`}
                    >
                      {ord.status}
                    </span>
                    <span className="recent-price">
                      ₹{ord.total.toFixed(2)} <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ====================================================================
           TAB 2: TABLE MANAGEMENT (Exact Right Screen in Reference Image)
           ==================================================================== */}
        {activeBottomTab === 'tables' && (
          <div className="m-tab-content m-tables-tab">
            {/* Table Header Bar */}
            <div className="m-table-top-bar">
              <h3 className="m-page-title">Table Management</h3>
              <div className="m-table-actions-right">
                <Search size={18} color="#475569" />
                <Filter size={18} color="#475569" />
              </div>
            </div>

            {/* Filter Pills */}
            <div className="m-table-filter-pills">
              <button
                className={`m-filter-pill ${tableFilter === 'all' ? 'active' : ''}`}
                onClick={() => setTableFilter('all')}
              >
                All ({tablesList.length})
              </button>
              <button
                className={`m-filter-pill green ${tableFilter === 'occupied' ? 'active' : ''
                  }`}
                onClick={() => setTableFilter('occupied')}
              >
                🟢 Occupied ({occupiedCount})
              </button>
              <button
                className={`m-filter-pill purple ${tableFilter === 'available' ? 'active' : ''
                  }`}
                onClick={() => setTableFilter('available')}
              >
                🟣 Available ({availableCount})
              </button>
            </div>

            {/* 4x4 Table Grid Cards */}
            <div className="m-tables-4grid">
              {filteredTables.map((tbl) => {
                const isOcc = tbl.status === 'Occupied';
                const isSelected = selectedTable.id === tbl.id;
                return (
                  <div
                    key={tbl.id}
                    className={`m-table-grid-card ${isOcc ? 'occupied' : 'available'} ${isSelected ? 'selected' : ''
                      }`}
                    onClick={() => setSelectedTable(tbl)}
                  >
                    <div className="table-card-icon-wrap">
                      <Armchair
                        size={22}
                        color={isOcc ? '#059669' : '#5025d1'}
                      />
                    </div>
                    <span className="table-card-id">{tbl.id}</span>
                    <span
                      className={`table-card-status-tag ${isOcc ? 'occupied' : 'available'
                        }`}
                    >
                      {isOcc ? '🟢 Occupied' : '🟣 Available'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Quick Table Actions Grid (2x2) */}
            <div className="m-section-header margin-top-14">
              <h3 className="m-section-title">Quick Table Actions</h3>
            </div>
            <div className="m-table-actions-2x2">
              <button
                className="m-table-act-btn"
                onClick={() => alert(`Transfer Table ${selectedTable.id}`)}
              >
                <ArrowRightLeft size={16} color="#5025d1" />
                <span>Transfer Table</span>
              </button>

              <button
                className="m-table-act-btn"
                onClick={() => alert(`Merge Table ${selectedTable.id}`)}
              >
                <Link size={16} color="#5025d1" />
                <span>Merge Tables</span>
              </button>

              <button
                className="m-table-act-btn"
                onClick={() => alert(`Change Table ${selectedTable.id}`)}
              >
                <ArrowRightLeft size={16} color="#5025d1" />
                <span>Change Table</span>
              </button>

              <button
                className="m-table-act-btn"
                onClick={() => {
                  const newCount = prompt('Enter Guest Count:', selectedTable.guests);
                  if (newCount) {
                    setGuestCount(parseInt(newCount) || 2);
                  }
                }}
              >
                <UserPlus size={16} color="#5025d1" />
                <span>Add Guests</span>
              </button>
            </div>

            {/* Selected Table Details Card */}
            <div className="m-selected-table-detail-card">
              <div className="detail-card-left">
                <div className="detail-table-id-badge">{selectedTable.id}</div>
                <div>
                  <h4 className="detail-table-title">{selectedTable.name}</h4>
                  <div className="detail-chairs-row">
                    <span>🪑 {selectedTable.capacity} Chairs</span>
                    <span>👥 {selectedTable.guests || guestCount} Guests</span>
                  </div>
                </div>
              </div>

              <div className="detail-card-right">
                <span
                  className={`detail-status-pill ${selectedTable.status === 'Occupied' ? 'occupied' : 'available'
                    }`}
                >
                  {selectedTable.status === 'Occupied'
                    ? '🟢 Occupied'
                    : '🟣 Available'}
                </span>
                <button
                  className="detail-take-order-btn"
                  onClick={() => setActiveBottomTab('orders')}
                >
                  Order <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
           TAB 3: FOOD ORDER & KOT PUNCH (Take Order Mobile View)
           ==================================================================== */}
        {activeBottomTab === 'orders' && (
          <div className="m-tab-content m-orders-tab">
            {/* Header / Table Select Bar */}
            <div className="m-order-header-bar">
              <div className="order-table-selector">
                <Armchair size={18} color="#5025d1" />
                <select
                  value={selectedTable.id}
                  onChange={(e) => {
                    const found = tablesList.find((t) => t.id === e.target.value);
                    if (found) setSelectedTable(found);
                  }}
                  className="table-select-dropdown"
                >
                  {tablesList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.id} ({t.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="guest-pax-stepper">
                <span>Pax:</span>
                <button
                  onClick={() => setGuestCount((g) => Math.max(1, g - 1))}
                >
                  -
                </button>
                <strong>{guestCount}</strong>
                <button onClick={() => setGuestCount((g) => g + 1)}>+</button>
              </div>
            </div>

            {/* Menu Search */}
            <div className="m-search-box">
              <Search size={16} color="#64748b" />
              <input
                type="text"
                placeholder="Search dishes (Biryani, Dosa, Naan...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Chips */}
            <div className="m-cat-scroll">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  className={`m-cat-chip ${selectedCategory === c.id ? 'active' : ''
                    }`}
                  onClick={() => setSelectedCategory(c.id)}
                >
                  <span>{c.icon}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>

            {/* Menu Dishes List */}
            <div className="m-dishes-grid">
              {filteredDishes.map((dish) => {
                const inCart = currentCart.find((i) => i.id === dish.id);
                return (
                  <div
                    key={dish.id}
                    className={`m-dish-card ${inCart ? 'in-cart' : ''}`}
                    onClick={() => handleAddToCart(dish)}
                  >
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="m-dish-img"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/mr-mango-logo.png';
                      }}
                    />
                    <div className="m-dish-info">
                      <h4 className="m-dish-title">{dish.name}</h4>
                      <div className="m-dish-bottom">
                        <span className="m-dish-price">
                          ₹{dish.price.toFixed(2)}
                        </span>
                        {inCart ? (
                          <span className="m-dish-qty-badge">
                            {inCart.quantity}
                          </span>
                        ) : (
                          <button className="m-add-btn">+</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Custom / Off-Menu Item Trigger */}
            <div className="m-custom-item-trigger-wrap">
              <button
                type="button"
                className="m-custom-item-trigger-btn"
                onClick={() => setIsCustomItemOpen(true)}
              >
                <Sparkles size={16} />
                <span>+ Add Custom / Off-Menu Dish</span>
              </button>
            </div>

            {/* Floating Order Cart Bar */}
            {currentCart.length > 0 && (
              <div className="m-cart-bottom-bar">
                <div className="cart-summary-text">
                  <span>{currentCart.length} Items Selected</span>
                  <strong>₹{cartSubtotal.toFixed(2)}</strong>
                </div>

                <button className="punch-kot-main-btn" onClick={handlePunchKOT}>
                  <Flame size={18} />
                  <span>Send KOT</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ====================================================================
           TAB 4: BILLS & SETTLEMENT
           ==================================================================== */}
        {activeBottomTab === 'bills' && (
          <div className="m-tab-content m-bills-tab">
            <div className="m-section-header">
              <h3 className="m-section-title">Active Table Bills</h3>
            </div>

            <div className="m-bills-list">
              {tablesList
                .filter((t) => t.status === 'Occupied')
                .map((tbl) => (
                  <div key={tbl.id} className="m-bill-card">
                    <div className="bill-card-top">
                      <div className="bill-table-badge">{tbl.id}</div>
                      <div>
                        <h4 className="bill-table-name">{tbl.name}</h4>
                        <span className="bill-items-count">
                          👥 {tbl.guests} Guests • {tbl.itemsCount} Items
                        </span>
                      </div>
                      <span className="bill-amount">₹{tbl.amount.toFixed(2)}</span>
                    </div>

                    <div className="bill-card-actions">
                      <button
                        className="req-bill-btn"
                        onClick={() =>
                          alert(`Receipt printed for Table ${tbl.id}`)
                        }
                      >
                        <Receipt size={14} /> Request Print Bill
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ====================================================================
           TAB 5: PROFILE & SWITCH USER
           ==================================================================== */}
        {activeBottomTab === 'profile' && (
          <div className="m-tab-content m-profile-tab">
            <div className="m-profile-card-large">
              <img
                src={currentUser?.avatar || '/food/avatar.jpg'}
                alt={currentUser?.name}
                className="profile-avatar-large"
              />
              <h3>{currentUser?.name || 'Ravi Kumar'}</h3>
              <span className="profile-role-badge">
                {currentUser?.roleLabel || 'Table Captain / Waiter'}
              </span>

              <div className="profile-actions-list">
                <button className="profile-action-row" onClick={onOpenLogin}>
                  <User size={18} />
                  <span>Switch Staff User</span>
                  <ChevronRight size={16} />
                </button>

                <button className="profile-action-row logout" onClick={onLogout}>
                  <ChefHat size={18} />
                  <span>Log Out from POS</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
           BOTTOM MOBILE APP BAR (5-Tab Navigation)
           ==================================================================== */}
        <div className="m-bottom-nav-bar">
          <button
            className={`m-nav-tab ${activeBottomTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveBottomTab('home')}
          >
            <Home size={20} />
            <span>Home</span>
          </button>

          <button
            className={`m-nav-tab ${activeBottomTab === 'tables' ? 'active' : ''}`}
            onClick={() => setActiveBottomTab('tables')}
          >
            <Armchair size={20} />
            <span>Tables</span>
          </button>

          <button
            className={`m-nav-tab cart-tab-btn ${activeBottomTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveBottomTab('orders')}
          >
            <div className="yellow-cart-circle">
              <ShoppingCart size={22} strokeWidth={2.4} color="#120c38" />
              {totalCartQty > 0 && (
                <span className="cart-badge-red-dot">{totalCartQty}</span>
              )}
            </div>
            <span>Orders</span>
          </button>

          <button
            className={`m-nav-tab ${activeBottomTab === 'bills' ? 'active' : ''}`}
            onClick={() => setActiveBottomTab('bills')}
          >
            <Receipt size={20} />
            <span>Bills</span>
          </button>

          <button
            className={`m-nav-tab ${activeBottomTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveBottomTab('profile')}
          >
            <User size={20} />
            <span>Profile</span>
          </button>
        </div>
      </div>

      {/* KOT Success Ticket Popup Modal */}
      {kotTicketModal && (
        <div className="pos-modal-overlay">
          <div className="pos-modal-card kot-success-card">
            <div className="kot-ticket-header">
              <div className="kot-stamp">
                <ChefHat size={24} color="#5025d1" />
                <div>
                  <h3 className="kot-ticket-heading">KITCHEN ORDER TICKET</h3>
                  <span className="kot-ticket-sub">
                    TastyBite • Live Supabase Sync
                  </span>
                </div>
              </div>
              <div className="kot-number-badge">
                <span>{kotTicketModal.kotNo}</span>
              </div>
            </div>

            <div className="kot-ticket-meta-grid">
              <div>
                <strong>Table:</strong> {kotTicketModal.table}
              </div>
              <div>
                <strong>Pax:</strong> {kotTicketModal.guests} Guests
              </div>
              <div>
                <strong>Waiter:</strong> {kotTicketModal.waiter}
              </div>
              <div>
                <strong>Time:</strong> {kotTicketModal.time}
              </div>
            </div>

            <div className="kot-ticket-items">
              <table className="kot-items-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {kotTicketModal.items.map((i, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="kot-item-name">{i.name}</div>
                        {i.notes && i.notes.length > 0 && (
                          <div className="kot-item-notes-text">
                            👉 Notes: {i.notes.join(', ')}
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                        x{i.quantity}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        ₹{(i.price * i.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="kot-ticket-footer-row">
              <span>Total Estimated:</span>
              <strong className="kot-total-val">
                ₹{kotTicketModal.totalAmount.toFixed(2)}
              </strong>
            </div>

            <button className="kot-done-btn" onClick={handleFinishKOTModal}>
              <CheckCircle2 size={18} />
              <span>KOT Punched Successfully (Done)</span>
            </button>
          </div>
        </div>
      )}

      {/* Custom Dish / Item Modal */}
      {isCustomItemOpen && (
        <div className="pos-modal-overlay">
          <div className="m-custom-item-modal">
            <div className="m-ci-modal-header">
              <div className="m-ci-title-wrap">
                <Sparkles size={18} color="#5025d1" />
                <div>
                  <h3>Add Custom Item</h3>
                  <p>Add off-menu dish to current order</p>
                </div>
              </div>
              <button
                type="button"
                className="m-ci-close-btn"
                onClick={() => setIsCustomItemOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddCustomItem}>
              <div className="m-ci-modal-body">
                <div className="m-ci-form-group">
                  <label>Dish / Item Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Special Mango Float"
                    value={customItemName}
                    onChange={(e) => setCustomItemName(e.target.value)}
                    autoFocus
                    required
                  />
                </div>

                <div className="m-ci-form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    placeholder="e.g. 150"
                    value={customItemPrice}
                    onChange={(e) => setCustomItemPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="m-ci-form-group">
                  <label>Category</label>
                  <select
                    value={customItemCategory}
                    onChange={(e) => setCustomItemCategory(e.target.value)}
                  >
                    <option value="starters">Starters / Snacks</option>
                    <option value="main">Main Course</option>
                    <option value="beverages">Beverages</option>
                    <option value="desserts">Desserts</option>
                  </select>
                </div>
              </div>

              <div className="m-ci-modal-footer">
                <button
                  type="button"
                  className="m-ci-cancel-btn"
                  onClick={() => setIsCustomItemOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="m-ci-add-btn">
                  <Plus size={16} />
                  <span>Add to Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
