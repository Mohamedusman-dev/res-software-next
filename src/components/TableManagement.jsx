import React, { useState } from 'react';
import {
  Armchair,
  Search,
  Filter,
  RefreshCw,
  Users,
  ChevronDown,
  Plus,
  Edit2,
  Trash2,
  X,
  MoreHorizontal
} from 'lucide-react';

const STATUS_CONFIG = {
  available: { label: 'Available', color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0', dot: '#10b981' },
  occupied: { label: 'Occupied', color: '#f97316', bg: '#fff7ed', border: '#fdba74', dot: '#f97316' },
  waiting: { label: 'Waiting', color: '#3b82f6', bg: '#eff6ff', border: '#93c5fd', dot: '#3b82f6' },
  billing: { label: 'Billing Requested', color: '#eab308', bg: '#fefce8', border: '#fde047', dot: '#eab308' },
  reserved: { label: 'Reserved', color: '#8b5cf6', bg: '#f5f3ff', border: '#c4b5fd', dot: '#8b5cf6' },
  cleaning: { label: 'Cleaning', color: '#ef4444', bg: '#fef2f2', border: '#fca5a5', dot: '#ef4444' },
};

const INITIAL_TABLES = [
  { id: 1, number: 1, capacity: 4, status: 'available', guests: 0, order: null, waiter: null, amount: 0, items: 0, reservation: null },
  { id: 2, number: 2, capacity: 4, status: 'occupied', guests: 3, order: 'ORD-101', waiter: 'Rohan Joshi', amount: 897.76, items: 3, reservation: null },
  { id: 3, number: 3, capacity: 4, status: 'available', guests: 0, order: null, waiter: null, amount: 0, items: 0, reservation: null },
  { id: 4, number: 4, capacity: 4, status: 'available', guests: 0, order: null, waiter: null, amount: 0, items: 0, reservation: null },
  { id: 5, number: 5, capacity: 4, status: 'billing', guests: 2, order: 'ORD-102', waiter: 'Rohan Joshi', amount: 977.56, items: 2, reservation: null },
  { id: 6, number: 6, capacity: 4, status: 'available', guests: 0, order: null, waiter: null, amount: 0, items: 0, reservation: null },
  { id: 7, number: 7, capacity: 4, status: 'available', guests: 0, order: null, waiter: null, amount: 0, items: 0, reservation: null },
  { id: 8, number: 8, capacity: 4, status: 'reserved', guests: 0, order: null, waiter: null, amount: 0, items: 0, reservation: 'Mehta Family (4 Pax) (20:00 Toni...)' },
  { id: 9, number: 9, capacity: 4, status: 'available', guests: 0, order: null, waiter: null, amount: 0, items: 0, reservation: null },
  { id: 10, number: 10, capacity: 4, status: 'available', guests: 0, order: null, waiter: null, amount: 0, items: 0, reservation: null },
  { id: 11, number: 11, capacity: 4, status: 'waiting', guests: 2, order: null, waiter: 'Karthik', amount: 0, items: 0, reservation: null },
  { id: 12, number: 12, capacity: 4, status: 'available', guests: 0, order: null, waiter: null, amount: 0, items: 0, reservation: null },
  { id: 13, number: 13, capacity: 4, status: 'cleaning', guests: 0, order: null, waiter: null, amount: 0, items: 0, reservation: null },
  { id: 14, number: 14, capacity: 4, status: 'available', guests: 0, order: null, waiter: null, amount: 0, items: 0, reservation: null },
  { id: 15, number: 15, capacity: 4, status: 'available', guests: 0, order: null, waiter: null, amount: 0, items: 0, reservation: null },
];

const SEAT_LABELS = ['A1', 'B1', 'C1', 'D1'];

export default function TableManagement() {
  const [tables, setTables] = useState(INITIAL_TABLES);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);

  const statusCounts = {
    all: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    waiting: tables.filter(t => t.status === 'waiting').length,
    billing: tables.filter(t => t.status === 'billing').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
    cleaning: tables.filter(t => t.status === 'cleaning').length,
  };

  const filteredTables = tables.filter(t => {
    const matchFilter = activeFilter === 'all' || t.status === activeFilter;
    const matchSearch = !searchQuery.trim() || 
      `Table ${t.number}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.order && t.order.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.waiter && t.waiter.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchFilter && matchSearch;
  });

  const handleStatusChange = (tableId, newStatus) => {
    setTables(prev => prev.map(t => 
      t.id === tableId ? { ...t, status: newStatus, guests: newStatus === 'available' ? 0 : t.guests, order: newStatus === 'available' ? null : t.order, amount: newStatus === 'available' ? 0 : t.amount, items: newStatus === 'available' ? 0 : t.items } : t
    ));
  };

  const getSeatColor = (table, seatIndex) => {
    if (table.status === 'occupied' || table.status === 'billing') {
      if (seatIndex < table.guests) return STATUS_CONFIG[table.status].color;
    }
    return '#e2e8f0';
  };

  const getBottomText = (table) => {
    if (table.status === 'available') return 'Ready for guests';
    if (table.status === 'cleaning') return 'Being cleaned...';
    if (table.status === 'waiting') return `Waiting for service (${table.guests} pax)`;
    if (table.status === 'reserved' && table.reservation) return table.reservation;
    if (table.order) return null;
    return '';
  };

  return (
    <div className="tm-root">
      <div className="tm-header">
        <div className="tm-title-wrap">
          <h2 className="tm-title">Visual Restaurant Floor Plan</h2>
          <p className="tm-subtitle">{tables.length} Tables &bull; 4 Seats per Table (A1, B1, C1, D1) &bull; Real-time Sync</p>
        </div>
        <div className="tm-header-actions">
          <div className="tm-search-box">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search table, order, waiter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="tm-refresh-btn" onClick={() => setTables([...INITIAL_TABLES])} title="Refresh Tables">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="tm-filter-bar">
        <button
          className={`tm-filter-pill ${activeFilter === 'all' ? 'active all' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All <span className="pill-count">({statusCounts.all})</span>
        </button>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <button
            key={key}
            className={`tm-filter-pill ${activeFilter === key ? `active ${key}` : ''}`}
            onClick={() => setActiveFilter(key)}
          >
            <span className="pill-dot" style={{ background: config.dot }}></span>
            {config.label} <span className="pill-count">({statusCounts[key]})</span>
          </button>
        ))}
      </div>

      <div className="tm-grid">
        {filteredTables.map((table) => {
          const cfg = STATUS_CONFIG[table.status];
          return (
            <div
              key={table.id}
              className={`tm-table-card ${table.status}`}
              style={{ borderColor: cfg.border }}
              onClick={() => setSelectedTable(selectedTable?.id === table.id ? null : table)}
            >
              <div className="tm-card-top">
                <h3 className="tm-table-name">Table {table.number}</h3>
                <span className="tm-status-badge" style={{ background: cfg.color, color: '#fff' }}>
                  {table.status === 'billing' ? 'Billing Requested' : cfg.label}
                </span>
              </div>

              <div className="tm-seat-layout">
                <div className="seat-top">
                  <span className="tm-seat" style={{ background: getSeatColor(table, 0), color: getSeatColor(table, 0) !== '#e2e8f0' ? '#fff' : '#94a3b8' }}>A1</span>
                </div>
                <div className="seat-middle">
                  <span className="tm-seat" style={{ background: getSeatColor(table, 3), color: getSeatColor(table, 3) !== '#e2e8f0' ? '#fff' : '#94a3b8' }}>D1</span>
                  <div className="tm-table-center" style={{ borderColor: table.status !== 'available' && table.status !== 'cleaning' ? cfg.color : '#e2e8f0' }}>
                    <span className="center-id">T-{table.number}</span>
                    <span className="center-chairs">{table.capacity} Chairs</span>
                    {(table.status === 'occupied' || table.status === 'billing') && table.amount > 0 && (
                      <span className="center-amount" style={{ color: cfg.color }}>&#8377;{table.amount.toFixed(2)}</span>
                    )}
                  </div>
                  <span className="tm-seat" style={{ background: getSeatColor(table, 1), color: getSeatColor(table, 1) !== '#e2e8f0' ? '#fff' : '#94a3b8' }}>B1</span>
                </div>
                <div className="seat-bottom">
                  <span className="tm-seat" style={{ background: getSeatColor(table, 2), color: getSeatColor(table, 2) !== '#e2e8f0' ? '#fff' : '#94a3b8' }}>C1</span>
                </div>
              </div>

              <div className="tm-card-bottom">
                {table.order ? (
                  <div className="tm-order-info">
                    <div className="tm-order-row">
                      <span className="tm-order-label">Order: {table.order}</span>
                      <span className="tm-items-count">{table.items} items</span>
                    </div>
                    <span className="tm-waiter-label">Waiter: {table.waiter}</span>
                  </div>
                ) : (
                  <span className="tm-bottom-text" style={{ color: cfg.color }}>
                    {getBottomText(table)}
                  </span>
                )}
              </div>

              {selectedTable?.id === table.id && (
                <div className="tm-action-bar">
                  {table.status === 'available' && (
                    <>
                      <button className="tm-act-btn green" onClick={(e) => { e.stopPropagation(); handleStatusChange(table.id, 'occupied'); }}>Seat Guests</button>
                      <button className="tm-act-btn purple" onClick={(e) => { e.stopPropagation(); handleStatusChange(table.id, 'reserved'); }}>Reserve</button>
                    </>
                  )}
                  {table.status === 'occupied' && (
                    <>
                      <button className="tm-act-btn yellow" onClick={(e) => { e.stopPropagation(); handleStatusChange(table.id, 'billing'); }}>Request Bill</button>
                      <button className="tm-act-btn red" onClick={(e) => { e.stopPropagation(); handleStatusChange(table.id, 'cleaning'); }}>Clear Table</button>
                    </>
                  )}
                  {table.status === 'billing' && (
                    <button className="tm-act-btn green" onClick={(e) => { e.stopPropagation(); handleStatusChange(table.id, 'cleaning'); }}>Payment Done</button>
                  )}
                  {(table.status === 'cleaning' || table.status === 'reserved' || table.status === 'waiting') && (
                    <button className="tm-act-btn green" onClick={(e) => { e.stopPropagation(); handleStatusChange(table.id, 'available'); }}>Mark Available</button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
