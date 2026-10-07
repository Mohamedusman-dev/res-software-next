import React, { useState } from 'react';
import {
  ChefHat,
  Search,
  Printer,
  Clock,
  Ban,
  CheckCircle2,
  ChevronDown,
  Filter,
  RefreshCw,
  Flame,
  AlertCircle
} from 'lucide-react';

const KOT_STATUS_CONFIG = {
  preparing: { label: 'PREPARING', color: '#f97316', bg: '#fff7ed', border: '#fdba74' },
  ready: { label: 'READY', color: '#10b981', bg: '#ecfdf5', border: '#6ee7b7' },
  served: { label: 'SERVED', color: '#3b82f6', bg: '#eff6ff', border: '#93c5fd' },
  cancelled: { label: 'CANCELLED', color: '#ef4444', bg: '#fef2f2', border: '#fca5a5' },
};

const INITIAL_KOTS = [
  {
    id: 'KOT-201',
    orderNumber: 'ORD-101',
    table: 'Table 2',
    tableNumber: 2,
    waiter: 'Rohan Joshi',
    status: 'preparing',
    priority: 'normal',
    items: [
      { name: 'Paneer Tikka Tandoori', seat: 'A1', quantity: 1 },
      { name: 'Butter Chicken Masala', seat: 'B1', quantity: 1 },
      { name: 'Butter Garlic Naan', seat: 'C1', quantity: 3 },
    ],
    createdAt: '9/8/2026, 11:30:00 PM',
    printCount: 1,
  },
  {
    id: 'KOT-202',
    orderNumber: 'ORD-102',
    table: 'Table 5',
    tableNumber: 5,
    waiter: 'Rohan Joshi',
    status: 'ready',
    priority: 'normal',
    items: [
      { name: 'Hyderabadi Dum Chicken Biryani', seat: 'A1', quantity: 2 },
      { name: 'Royal Mango Lassi', seat: 'B1', quantity: 2 },
    ],
    createdAt: '9/8/2026, 11:15:00 PM',
    printCount: 1,
  },
  {
    id: 'KOT-203',
    orderNumber: 'ORD-103',
    table: 'Table 11',
    tableNumber: 11,
    waiter: 'Karthik',
    status: 'preparing',
    priority: 'high',
    items: [
      { name: 'Chicken Biryani', seat: 'A1', quantity: 2 },
      { name: 'Cold Coffee', seat: 'B1', quantity: 2 },
      { name: 'French Fries', seat: 'A1', quantity: 1 },
    ],
    createdAt: '9/8/2026, 11:45:00 PM',
    printCount: 0,
  },
  {
    id: 'KOT-204',
    orderNumber: 'ORD-104',
    table: 'Table 3',
    tableNumber: 3,
    waiter: 'Raju',
    status: 'served',
    priority: 'normal',
    items: [
      { name: 'Masala Dosa', seat: 'A1', quantity: 2 },
      { name: 'Idli Sambar', seat: 'B1', quantity: 1 },
      { name: 'Fresh Lime Soda', seat: 'C1', quantity: 2 },
    ],
    createdAt: '9/8/2026, 10:30:00 PM',
    printCount: 2,
  },
  {
    id: 'KOT-205',
    orderNumber: 'ORD-105',
    table: 'Table 7',
    tableNumber: 7,
    waiter: 'Rohan Joshi',
    status: 'cancelled',
    priority: 'normal',
    items: [
      { name: 'Veg Burger', seat: 'A1', quantity: 1 },
      { name: 'Coke', seat: 'A1', quantity: 1 },
    ],
    createdAt: '9/8/2026, 10:00:00 PM',
    printCount: 1,
  },
];

export default function KitchenKOT() {
  const [kots, setKots] = useState(INITIAL_KOTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredKots = kots.filter(k => {
    const matchStatus = statusFilter === 'all' || k.status === statusFilter;
    const matchSearch = !searchQuery.trim() ||
      k.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.table.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.waiter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleStatusUpdate = (kotId, newStatus) => {
    setKots(prev => prev.map(k => k.id === kotId ? { ...k, status: newStatus } : k));
  };

  const handleReprint = (kotId) => {
    setKots(prev => prev.map(k => k.id === kotId ? { ...k, printCount: k.printCount + 1 } : k));
    alert(`Reprinting ${kotId} to thermal printer...`);
  };

  const statusFilterOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'served', label: 'Served' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const preparingCount = kots.filter(k => k.status === 'preparing').length;
  const readyCount = kots.filter(k => k.status === 'ready').length;

  return (
    <div className="kot-root">
      <div className="kot-header">
        <div className="kot-title-wrap">
          <div className="kot-icon-circle">
            <ChefHat size={24} color="#5025d1" />
          </div>
          <div>
            <h2 className="kot-title">Kitchen Order Tickets (KOT)</h2>
            <p className="kot-subtitle">View generated kitchen tickets, reprint to thermal printer, or cancel items with reason audit.</p>
          </div>
        </div>
        <div className="kot-header-actions">
          <div className="kot-search-box">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search KOT #, Table, Waiter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="kot-filter-dropdown-wrap">
            <button className="kot-filter-btn" onClick={() => setIsFilterOpen(!isFilterOpen)}>
              {statusFilterOptions.find(o => o.value === statusFilter)?.label}
              <ChevronDown size={14} />
            </button>
            {isFilterOpen && (
              <div className="kot-filter-dropdown">
                {statusFilterOptions.map(opt => (
                  <button
                    key={opt.value}
                    className={`kot-filter-option ${statusFilter === opt.value ? 'active' : ''}`}
                    onClick={() => { setStatusFilter(opt.value); setIsFilterOpen(false); }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="kot-stats-bar">
        <div className="kot-stat preparing">
          <Flame size={16} />
          <span>{preparingCount} Preparing</span>
        </div>
        <div className="kot-stat ready">
          <CheckCircle2 size={16} />
          <span>{readyCount} Ready to Serve</span>
        </div>
      </div>

      <div className="kot-cards-grid">
        {filteredKots.length === 0 ? (
          <div className="kot-empty">
            <ChefHat size={48} color="#cbd5e1" />
            <h3>No KOT Tickets Found</h3>
            <p>All kitchen orders have been processed or no tickets match your filter.</p>
          </div>
        ) : (
          filteredKots.map((kot) => {
            const cfg = KOT_STATUS_CONFIG[kot.status];
            return (
              <div
                key={kot.id}
                className={`kot-ticket-card ${kot.status}`}
                style={{ borderLeftColor: cfg.color }}
              >
                <div className="kot-card-header">
                  <div className="kot-card-id-row">
                    <div>
                      <span className="kot-card-id">{kot.id}</span>
                      <span className="kot-card-order">({kot.orderNumber})</span>
                    </div>
                    <span className="kot-card-status-badge" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                      {cfg.label}
                    </span>
                  </div>
                  <div className="kot-card-meta-row">
                    <span className="kot-card-table">{kot.table}</span>
                    <span className="kot-card-waiter">Waiter: {kot.waiter}</span>
                  </div>
                  {kot.priority === 'high' && (
                    <div className="kot-priority-badge">
                      <AlertCircle size={12} />
                      <span>HIGH PRIORITY</span>
                    </div>
                  )}
                </div>

                <div className="kot-card-items">
                  {kot.items.map((item, idx) => (
                    <div key={idx} className="kot-item-row">
                      <div className="kot-item-left">
                        <span className="kot-item-name">{item.name}</span>
                        <span className="kot-item-seat">[{item.seat}]</span>
                      </div>
                      <div className="kot-item-right">
                        <span className="kot-item-qty">x{item.quantity}</span>
                        <Ban size={14} color="#cbd5e1" className="kot-item-cancel-icon" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="kot-card-footer">
                  <div className="kot-card-timestamp">
                    <Clock size={13} color="#94a3b8" />
                    <span>Created: {kot.createdAt}</span>
                  </div>
                  <div className="kot-card-actions-row">
                    <span className="kot-print-count">Printed: {kot.printCount} time(s)</span>
                    <button className="kot-reprint-btn" onClick={() => handleReprint(kot.id)}>
                      <Printer size={14} />
                      <span>Reprint KOT</span>
                    </button>
                  </div>
                  {(kot.status === 'preparing' || kot.status === 'ready') && (
                    <div className="kot-status-actions">
                      {kot.status === 'preparing' && (
                        <button className="kot-mark-ready-btn" onClick={() => handleStatusUpdate(kot.id, 'ready')}>
                          <CheckCircle2 size={14} />
                          <span>Mark Ready</span>
                        </button>
                      )}
                      {kot.status === 'ready' && (
                        <button className="kot-mark-served-btn" onClick={() => handleStatusUpdate(kot.id, 'served')}>
                          <CheckCircle2 size={14} />
                          <span>Mark Served</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
