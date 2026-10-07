import React, { useState, useEffect, useCallback } from 'react';
import {
  ChefHat,
  Bell,
  Search,
  ClipboardList,
  Flame,
  BellRing,
  CheckCircle2,
  XCircle,
  UtensilsCrossed,
  Sparkles,
  Settings,
  Power,
  Clock,
  Send,
  X,
  Play,
  Ban,
  Timer,
  Truck,
  ShoppingBag,
  LayoutGrid
} from 'lucide-react';
import { subscribeToLiveSync, broadcastLiveEvent } from '../lib/supabase';

const INITIAL_KITCHEN_ORDERS = [
  {
    id: 'ORD-00121',
    table: 'T1',
    type: 'Dine In',
    status: 'new',
    items: [
      { name: 'Chicken Biryani', qty: 1, seat: 'A1' },
      { name: 'Cold Coffee', qty: 2, seat: 'B1' },
    ],
    time: new Date(Date.now() - 38 * 60000).toISOString(),
    waiter: 'Raju',
    totalItems: 3,
  },
  {
    id: 'ORD-00120',
    table: 'T5',
    type: 'Dine In',
    status: 'preparing',
    items: [
      { name: 'Paneer Pizza', qty: 1, seat: 'A1' },
      { name: 'French Fries', qty: 2, seat: 'B1' },
      { name: 'Coke', qty: 2, seat: 'C1' },
    ],
    time: new Date(Date.now() - 55 * 60000).toISOString(),
    waiter: 'Karthik',
    totalItems: 5,
  },
  {
    id: 'ORD-00119',
    table: 'T2',
    type: 'Takeaway',
    status: 'ready',
    items: [
      { name: 'Masala Dosa', qty: 2, seat: 'A1' },
      { name: 'Idli Sambar', qty: 1, seat: 'B1' },
    ],
    time: new Date(Date.now() - 72 * 60000).toISOString(),
    waiter: 'Rohan',
    totalItems: 3,
  },
  {
    id: 'ORD-00118',
    table: 'T8',
    type: 'Delivery',
    status: 'completed',
    items: [
      { name: 'Hakka Noodles', qty: 1, seat: 'A1' },
      { name: 'Veg Burger', qty: 1, seat: 'A1' },
    ],
    time: new Date(Date.now() - 120 * 60000).toISOString(),
    waiter: 'Raju',
    totalItems: 2,
  },
  {
    id: 'ORD-00117',
    table: 'T3',
    type: 'Dine In',
    status: 'cancelled',
    items: [
      { name: 'Fresh Lime', qty: 3, seat: 'A1' },
    ],
    time: new Date(Date.now() - 150 * 60000).toISOString(),
    waiter: 'Karthik',
    totalItems: 3,
  },
];

const NAV_ITEMS = [
  { id: 'all', label: 'All Orders', icon: ClipboardList },
  { id: 'new', label: 'New Orders', icon: BellRing },
  { id: 'preparing', label: 'Preparing', icon: Flame },
  { id: 'ready', label: 'Ready to Serve', icon: Bell },
  { id: 'completed', label: 'Completed', icon: CheckCircle2 },
  { id: 'cancelled', label: 'Cancelled', icon: XCircle },
  { id: 'divider', label: '', icon: null },
  { id: 'menu_items', label: 'Menu Items', icon: UtensilsCrossed },
  { id: 'table_clean', label: 'Table Clean', icon: Sparkles },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const ORDER_TYPE_FILTERS = [
  { id: 'all', label: 'All Types', icon: LayoutGrid },
  { id: 'Dine In', label: 'Dine In', icon: UtensilsCrossed },
  { id: 'Takeaway', label: 'Takeaway', icon: ShoppingBag },
  { id: 'Delivery', label: 'Delivery', icon: Truck },
];

function getTimeAgo(isoStr) {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} mins ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
}

function getTimeFormatted(isoStr) {
  return new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function KitchenDisplaySystem() {
  const [orders, setOrders] = useState(INITIAL_KITCHEN_ORDERS);
  const [activeNav, setActiveNav] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [activities, setActivities] = useState([
    { id: 1, text: 'Order #ORD-00121 from Table T1 has been submitted', time: getTimeFormatted(INITIAL_KITCHEN_ORDERS[0].time), type: 'new' },
    { id: 2, text: 'Order #ORD-00120 moved to Preparing', time: getTimeFormatted(INITIAL_KITCHEN_ORDERS[1].time), type: 'preparing' },
    { id: 3, text: 'Order #ORD-00119 is Ready to Serve', time: getTimeFormatted(INITIAL_KITCHEN_ORDERS[2].time), type: 'ready' },
  ]);
  const [notifications, setNotifications] = useState([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToLiveSync((data) => {
      if (data.type === 'KOT_PUNCHED' && data.payload) {
        const kot = data.payload;
        const newOrder = {
          id: kot.kotNo || `ORD-${Date.now()}`,
          table: kot.table || 'T?',
          type: 'Dine In',
          status: 'new',
          items: (kot.items || []).map(i => ({ name: i.name, qty: i.quantity, seat: 'A1' })),
          time: new Date().toISOString(),
          waiter: kot.waiter || 'Staff',
          totalItems: (kot.items || []).reduce((s, i) => s + i.quantity, 0),
        };
        setOrders(prev => [newOrder, ...prev]);
        const activity = {
          id: Date.now(),
          text: `New Order Received! Order #${newOrder.id} from Table ${newOrder.table}`,
          time: getTimeFormatted(newOrder.time),
          type: 'new',
        };
        setActivities(prev => [activity, ...prev].slice(0, 20));
        setNotifications(prev => [activity, ...prev]);
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== activity.id));
        }, 6000);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleStatusChange = useCallback((orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    const order = orders.find(o => o.id === orderId);
    const labels = { preparing: 'Started Preparing', ready: 'Ready to Serve', completed: 'Completed', cancelled: 'Cancelled' };
    const activity = {
      id: Date.now(),
      text: `Order #${orderId} - ${labels[newStatus] || newStatus}${order ? ` (Table ${order.table})` : ''}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: newStatus,
    };
    setActivities(prev => [activity, ...prev].slice(0, 20));
    broadcastLiveEvent('KOT_STATUS_CHANGED', { orderId, status: newStatus, table: order?.table });
  }, [orders]);

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const counts = {
    new: orders.filter(o => o.status === 'new').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  let filtered = orders.filter(o => {
    if (activeNav !== 'all' && activeNav !== 'menu_items' && activeNav !== 'table_clean' && activeNav !== 'settings') {
      if (o.status !== activeNav) return false;
    }
    if (typeFilter !== 'all' && o.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!o.id.toLowerCase().includes(q) && !o.table.toLowerCase().includes(q) && !o.items.some(i => i.name.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  if (sortBy === 'newest') {
    filtered = [...filtered].sort((a, b) => new Date(b.time) - new Date(a.time));
  } else {
    filtered = [...filtered].sort((a, b) => new Date(a.time) - new Date(b.time));
  }

  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');

  const currentTime = new Date();
  const timeStr = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="kds-root">
      <aside className="kds-sidebar">
        <div className="kds-sidebar-brand">
          <div className="kds-brand-icon">
            <ChefHat size={22} color="#fbbf24" strokeWidth={2.5} />
          </div>
          <div className="kds-brand-text">
            <span className="kds-brand-name">Mr. Mango</span>
            <span className="kds-brand-sub">Kitchen</span>
          </div>
        </div>
        <div className="kds-panel-badge">KITCHEN PANEL</div>
        <nav className="kds-sidebar-nav">
          {NAV_ITEMS.map((item) => {
            if (item.id === 'divider') return <div key="div" className="kds-nav-divider" />;
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            const count = counts[item.id];
            return (
              <button
                key={item.id}
                className={`kds-nav-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveNav(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {count !== undefined && count > 0 && <span className="kds-nav-count">{count}</span>}
              </button>
            );
          })}
        </nav>
        <div className="kds-sidebar-footer">
          <button className="kds-logout-btn">
            <Power size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="kds-main">
        <header className="kds-header">
          <div className="kds-header-left">
            <div className="kds-header-icon">
              <ChefHat size={28} color="#fbbf24" />
            </div>
            <div>
              <h1 className="kds-header-title">Kitchen Display System</h1>
              <p className="kds-header-sub">Manage &amp; track all incoming orders</p>
            </div>
          </div>
          <div className="kds-header-right">
            <button className="kds-notif-btn">
              <Bell size={20} />
              {counts.new > 0 && <span className="kds-notif-badge">{counts.new}</span>}
            </button>
            <div className="kds-clock-box">
              <span className="kds-clock-time">{timeStr}</span>
              <span className="kds-clock-date">{dateStr}</span>
            </div>
          </div>
        </header>

        <div className="kds-search-bar">
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search order ID, table, item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="kds-kpi-row">
          <div className="kds-kpi blue">
            <div className="kds-kpi-icon blue"><ClipboardList size={22} color="#fff" /></div>
            <div className="kds-kpi-info">
              <strong className="kds-kpi-val">{counts.new}</strong>
              <span className="kds-kpi-label">New Orders</span>
            </div>
          </div>
          <div className="kds-kpi orange">
            <div className="kds-kpi-icon orange"><Flame size={22} color="#fff" /></div>
            <div className="kds-kpi-info">
              <strong className="kds-kpi-val">{counts.preparing}</strong>
              <span className="kds-kpi-label">Preparing</span>
            </div>
          </div>
          <div className="kds-kpi green">
            <div className="kds-kpi-icon green"><BellRing size={22} color="#fff" /></div>
            <div className="kds-kpi-info">
              <strong className="kds-kpi-val">{counts.ready}</strong>
              <span className="kds-kpi-label">Ready to Serve</span>
            </div>
          </div>
          <div className="kds-kpi purple">
            <div className="kds-kpi-icon purple"><CheckCircle2 size={22} color="#fff" /></div>
            <div className="kds-kpi-info">
              <strong className="kds-kpi-val">{counts.completed}</strong>
              <span className="kds-kpi-label">Completed</span>
            </div>
          </div>
        </div>

        <div className="kds-content-grid">
          <div className="kds-orders-panel">
            <div className="kds-orders-header">
              <div>
                <h2 className="kds-orders-title">
                  {activeNav === 'all' ? 'All Active Orders' : NAV_ITEMS.find(n => n.id === activeNav)?.label || 'Orders'}
                  <span className="kds-orders-count">{filtered.length}</span>
                </h2>
                <p className="kds-orders-sub">Live queue &bull; auto-updates across stations</p>
              </div>
              <div className="kds-sort-wrap">
                <span className="kds-sort-label">Sort by:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="kds-sort-select">
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </div>
            </div>

            <div className="kds-type-filters">
              {ORDER_TYPE_FILTERS.map(f => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.id}
                    className={`kds-type-pill ${typeFilter === f.id ? 'active' : ''}`}
                    onClick={() => setTypeFilter(f.id)}
                  >
                    <Icon size={14} />
                    <span>{f.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="kds-orders-list">
              {filtered.length === 0 ? (
                <div className="kds-empty">
                  <CheckCircle2 size={40} color="#cbd5e1" />
                  <h3>No orders found</h3>
                  <p>All caught up! No orders match your current filter.</p>
                </div>
              ) : (
                filtered.map(order => (
                  <div key={order.id} className={`kds-order-card ${order.status}`}>
                    <div className="kds-oc-top">
                      <div className="kds-oc-left">
                        <span className="kds-oc-id">#{order.id}</span>
                        <div className="kds-oc-items-list">
                          {order.items.map((item, idx) => (
                            <span key={idx} className="kds-oc-item">
                              &bull; {item.name} <strong>x{item.qty}</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="kds-oc-right">
                        <span className={`kds-oc-type-tag ${order.type.toLowerCase().replace(/\s/g, '-')}`}>
                          {order.type === 'Dine In' && <UtensilsCrossed size={12} />}
                          {order.type === 'Takeaway' && <ShoppingBag size={12} />}
                          {order.type === 'Delivery' && <Truck size={12} />}
                          {order.type}
                        </span>
                        <span className="kds-oc-time">{getTimeFormatted(order.time)}</span>
                        <span className="kds-oc-ago">
                          <Timer size={12} /> {getTimeAgo(order.time)}
                        </span>
                      </div>
                    </div>
                    <div className="kds-oc-bottom">
                      <div className="kds-oc-meta">
                        <span className="kds-oc-table">Table {order.table}</span>
                        <span className="kds-oc-count">{order.totalItems} Items</span>
                      </div>
                      <div className="kds-oc-status-wrap">
                        <span className={`kds-oc-status-badge ${order.status}`}>
                          {order.status === 'new' && 'New'}
                          {order.status === 'preparing' && 'Preparing'}
                          {order.status === 'ready' && 'Ready'}
                          {order.status === 'completed' && 'Completed'}
                          {order.status === 'cancelled' && 'Cancelled'}
                        </span>
                      </div>
                    </div>
                    <div className="kds-oc-actions">
                      {order.status === 'new' && (
                        <>
                          <button className="kds-action-btn primary" onClick={() => handleStatusChange(order.id, 'preparing')}>
                            <Play size={14} /> Start Preparing
                          </button>
                          <button className="kds-action-link cancel" onClick={() => handleStatusChange(order.id, 'cancelled')}>Cancel</button>
                        </>
                      )}
                      {order.status === 'preparing' && (
                        <button className="kds-action-btn ready" onClick={() => handleStatusChange(order.id, 'ready')}>
                          <Bell size={14} /> Mark Ready
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <button className="kds-action-btn completed" onClick={() => handleStatusChange(order.id, 'completed')}>
                          <CheckCircle2 size={14} /> Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="kds-side-panels">
            <div className="kds-side-card">
              <div className="kds-side-header">
                <h3>Preparing Orders</h3>
                <button className="kds-view-all" onClick={() => setActiveNav('preparing')}>View all</button>
              </div>
              {preparingOrders.length === 0 ? (
                <p className="kds-side-empty">No orders</p>
              ) : (
                <div className="kds-side-list">
                  {preparingOrders.slice(0, 4).map(o => (
                    <div key={o.id} className="kds-side-item preparing">
                      <div className="kds-si-left">
                        <span className="kds-si-id">#{o.id}</span>
                        <span className="kds-si-table">Table {o.table} &bull; {o.totalItems} items</span>
                      </div>
                      <button className="kds-si-btn ready" onClick={() => handleStatusChange(o.id, 'ready')}>
                        Ready
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="kds-side-card">
              <div className="kds-side-header">
                <h3>Ready to Serve</h3>
                <button className="kds-view-all" onClick={() => setActiveNav('ready')}>View all</button>
              </div>
              {readyOrders.length === 0 ? (
                <p className="kds-side-empty">No orders</p>
              ) : (
                <div className="kds-side-list">
                  {readyOrders.slice(0, 4).map(o => (
                    <div key={o.id} className="kds-side-item ready">
                      <div className="kds-si-left">
                        <span className="kds-si-id">#{o.id}</span>
                        <span className="kds-si-table">Table {o.table} &bull; {o.totalItems} items</span>
                      </div>
                      <button className="kds-si-btn completed" onClick={() => handleStatusChange(o.id, 'completed')}>
                        Done
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="kds-side-card activity">
              <div className="kds-side-header">
                <h3>Recent Activity</h3>
              </div>
              <div className="kds-activity-list">
                {activities.slice(0, 6).map(a => (
                  <div key={a.id} className={`kds-activity-row ${a.type}`}>
                    <div className={`kds-act-icon ${a.type}`}>
                      {a.type === 'new' && <Send size={14} />}
                      {a.type === 'preparing' && <Flame size={14} />}
                      {a.type === 'ready' && <Bell size={14} />}
                      {a.type === 'completed' && <CheckCircle2 size={14} />}
                      {a.type === 'cancelled' && <XCircle size={14} />}
                    </div>
                    <div className="kds-act-info">
                      <span className="kds-act-text">{a.text}</span>
                      <span className="kds-act-time">{a.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {notifications.length > 0 && (
        <div className="kds-toast-stack">
          {notifications.map(n => (
            <div key={n.id} className="kds-toast">
              <div className="kds-toast-icon"><Send size={18} /></div>
              <div className="kds-toast-content">
                <strong>New Order Received!</strong>
                <span>{n.text}</span>
              </div>
              <span className="kds-toast-time">{n.time}</span>
              <button className="kds-toast-close" onClick={() => dismissNotification(n.id)}><X size={16} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
