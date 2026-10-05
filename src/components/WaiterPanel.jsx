import React, { useState } from 'react';
import {
  Armchair,
  Users,
  ChefHat,
  Search,
  Plus,
  Minus,
  Trash2,
  Utensils,
  Flame,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { CATEGORIES } from '../data/menuData';
import { broadcastLiveEvent } from '../lib/supabase';

const WAITER_TABLES = [
  { id: 'T-01', name: 'Table 1', guests: 2, status: 'Occupied', area: 'Main Hall' },
  { id: 'T-02', name: 'Table 2', guests: 4, status: 'Available', area: 'Main Hall' },
  { id: 'T-03', name: 'Table 3', guests: 4, status: 'Occupied', area: 'Main Hall' },
  { id: 'T-04', name: 'Table 4', guests: 6, status: 'Available', area: 'Main Hall' },
  { id: 'T-05', name: 'Table 5', guests: 2, status: 'Available', area: 'Family AC' },
  { id: 'VIP-1', name: 'VIP Suite 1', guests: 8, status: 'Available', area: 'VIP Lounge' },
  { id: 'VIP-2', name: 'VIP Suite 2', guests: 6, status: 'Occupied', area: 'VIP Lounge' },
  { id: 'OUT-1', name: 'Garden 1', guests: 4, status: 'Available', area: 'Outdoor' }
];

const QUICK_NOTES = [
  'Less Spicy',
  'Extra Spicy',
  'No Onion/Garlic',
  'Less Oil',
  'Extra Gravy',
  'Served Hot',
  'Quick Serve'
];

export default function WaiterPanel({
  menuItems,
  currentUser,
  onSendKOT,
  onOpenLogin
}) {
  const [selectedTable, setSelectedTable] = useState(WAITER_TABLES[0]);
  const [guestCount, setGuestCount] = useState(2);
  const [waiterOrder, setWaiterOrder] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeItemForNote, setActiveItemForNote] = useState(null);
  const [customNoteInput, setCustomNoteInput] = useState('');
  const [kotSuccessTicket, setKotSuccessTicket] = useState(null);

  // Add Item to Waiter Order
  const handleAddItem = (dish) => {
    setWaiterOrder((prev) => {
      const existing = prev.find((item) => item.id === dish.id);
      if (existing) {
        return prev.map((item) =>
          item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: dish.id,
          name: dish.name,
          price: dish.price,
          quantity: 1,
          image: dish.image,
          category: dish.category,
          notes: []
        }
      ];
    });
  };

  // Stepper
  const handleUpdateQty = (id, delta) => {
    setWaiterOrder((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // Remove
  const handleRemove = (id) => {
    setWaiterOrder((prev) => prev.filter((item) => item.id !== id));
  };

  // Add Note to item
  const handleToggleNote = (dishId, noteText) => {
    setWaiterOrder((prev) =>
      prev.map((item) => {
        if (item.id === dishId) {
          const notes = item.notes || [];
          const exists = notes.includes(noteText);
          const updatedNotes = exists
            ? notes.filter((n) => n !== noteText)
            : [...notes, noteText];
          return { ...item, notes: updatedNotes };
        }
        return item;
      })
    );
  };

  // Custom Note Submit
  const handleAddCustomNote = (dishId) => {
    if (!customNoteInput.trim()) return;
    handleToggleNote(dishId, customNoteInput.trim());
    setCustomNoteInput('');
  };

  // Filtered Menu Items
  const filteredItems = menuItems.filter((item) => {
    const matchesCat =
      selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Calculate Subtotal
  const subtotal = waiterOrder.reduce(
    (acc, i) => acc + i.price * i.quantity,
    0
  );

  // Send KOT handler
  const handlePunchKOT = () => {
    if (waiterOrder.length === 0) return;

    const kotNumber = 'KOT-' + Math.floor(1000 + Math.random() * 9000);
    const newKot = {
      kotNo: kotNumber,
      table: selectedTable.id,
      area: selectedTable.area,
      guests: guestCount,
      waiter: currentUser?.name || 'Waiter Raju',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items: [...waiterOrder],
      totalAmount: subtotal
    };

    setKotSuccessTicket(newKot);
    
    // Broadcast live to Cashier and Kitchen via Supabase / Realtime channel
    broadcastLiveEvent('KOT_PUNCHED', newKot);

    if (onSendKOT) {
      onSendKOT(newKot);
    }
  };

  const handleFinishKOT = () => {
    setKotSuccessTicket(null);
    setWaiterOrder([]);
  };

  return (
    <div className="waiter-panel-container">
      {/* 1. Top Waiter Bar */}
      <div className="waiter-top-bar">
        {/* Waiter Profile & Switch */}
        <div className="waiter-profile-card">
          <div className="waiter-avatar-box">
            <img
              src={currentUser?.avatar || '/food/avatar.jpg'}
              alt={currentUser?.name}
              className="waiter-avatar-img"
            />
            <span className="waiter-status-online"></span>
          </div>
          <div className="waiter-profile-meta">
            <div className="waiter-role-row">
              <span className="waiter-role-tag">WAITER TERMINAL</span>
              <button
                className="waiter-switch-btn"
                onClick={onOpenLogin}
                title="Switch Staff User"
              >
                Switch User
              </button>
            </div>
            <h3 className="waiter-name-heading">
              {currentUser?.name || 'Raju (Waiter 1)'}
            </h3>
          </div>
        </div>

        {/* Table Selector Pills */}
        <div className="waiter-tables-scroll-wrap">
          <span className="waiter-bar-label">
            <Armchair size={15} /> Select Table:
          </span>
          <div className="waiter-table-pills">
            {WAITER_TABLES.map((t) => {
              const isSelected = selectedTable.id === t.id;
              const isOcc = t.status === 'Occupied';
              return (
                <button
                  key={t.id}
                  className={`waiter-table-pill ${isSelected ? 'selected' : ''} ${
                    isOcc ? 'occupied' : 'available'
                  }`}
                  onClick={() => setSelectedTable(t)}
                >
                  <span className="table-pill-id">{t.id}</span>
                  <span className="table-pill-status">
                    {isOcc ? '🔴 Active' : '🟢 Free'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Guest Count Stepper */}
        <div className="waiter-guests-box">
          <span className="guest-box-label">
            <Users size={14} /> Guests (Pax):
          </span>
          <div className="guest-stepper">
            <button
              onClick={() => setGuestCount((g) => Math.max(1, g - 1))}
              className="guest-step-btn"
            >
              -
            </button>
            <span className="guest-step-count">{guestCount}</span>
            <button
              onClick={() => setGuestCount((g) => g + 1)}
              className="guest-step-btn"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Workspace: Left Menu Catalog + Right Waiter Order Ticket */}
      <div className="waiter-main-split">
        {/* Left: Cloned Menu Selection with Categories */}
        <div className="waiter-menu-column">
          {/* Search and Category Bar */}
          <div className="waiter-search-row">
            <div className="waiter-search-input-wrap">
              <Search size={18} className="waiter-search-icon" />
              <input
                type="text"
                placeholder="Search dishes by name or category (Biryani, Dosa, Tea...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="waiter-search-input"
              />
              {searchQuery && (
                <button
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="waiter-quick-stats">
              <span className="stats-badge">
                <Utensils size={14} /> {filteredItems.length} Dishes
              </span>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="waiter-category-pills">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  className={`waiter-cat-pill ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <span className="cat-pill-icon">{cat.icon}</span>
                  <span className="cat-pill-name">{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Menu Items Grid */}
          <div className="waiter-dishes-grid">
            {filteredItems.map((dish) => {
              const inOrder = waiterOrder.find((i) => i.id === dish.id);
              return (
                <div
                  key={dish.id}
                  className={`waiter-dish-card ${inOrder ? 'in-order' : ''}`}
                  onClick={() => handleAddItem(dish)}
                >
                  <div className="dish-card-img-wrap">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/mr-mango-logo.png';
                      }}
                    />
                    {inOrder && (
                      <span className="dish-ordered-badge">
                        {inOrder.quantity} in Order
                      </span>
                    )}
                  </div>

                  <div className="dish-card-content">
                    <h4 className="dish-card-title">{dish.name}</h4>
                    <div className="dish-card-bottom">
                      <span className="dish-card-price">
                        ₹{dish.price.toFixed(2)}
                      </span>
                      <button className="dish-add-circle-btn">
                        <Plus size={16} strokeWidth={2.6} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Waiter Order & KOT Punch Panel */}
        <div className="waiter-order-column">
          {/* Order Header */}
          <div className="waiter-order-header">
            <div className="order-table-title-wrap">
              <div className="order-table-badge">
                <Armchair size={18} />
                <span>{selectedTable.id}</span>
              </div>
              <div>
                <h3 className="order-table-title">{selectedTable.name}</h3>
                <span className="order-area-tag">
                  {selectedTable.area} • {guestCount} Pax
                </span>
              </div>
            </div>

            {waiterOrder.length > 0 && (
              <button
                className="waiter-clear-order-btn"
                onClick={() => setWaiterOrder([])}
                title="Clear All"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>

          {/* Items List */}
          <div className="waiter-order-items-scroll">
            {waiterOrder.length === 0 ? (
              <div className="waiter-empty-order">
                <div className="empty-order-circle">
                  <Utensils size={36} color="#8b5cf6" />
                </div>
                <h4>No Items Added Yet</h4>
                <p>
                  Tap any dish on the left menu to quickly take table order for{' '}
                  <strong>{selectedTable.name}</strong>.
                </p>
              </div>
            ) : (
              waiterOrder.map((item) => {
                const isNotesOpen = activeItemForNote === item.id;
                return (
                  <div key={item.id} className="waiter-item-card">
                    <div className="waiter-item-main-row">
                      <div className="waiter-item-info">
                        <h4 className="waiter-item-title">{item.name}</h4>
                        <span className="waiter-item-subtotal">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      {/* Stepper */}
                      <div className="waiter-qty-stepper">
                        <button
                          className="waiter-step-btn"
                          onClick={() => handleUpdateQty(item.id, -1)}
                        >
                          <Minus size={13} strokeWidth={2.5} />
                        </button>
                        <span className="waiter-step-qty">{item.quantity}</span>
                        <button
                          className="waiter-step-btn plus"
                          onClick={() => handleUpdateQty(item.id, 1)}
                        >
                          <Plus size={13} strokeWidth={2.5} />
                        </button>
                        <button
                          className="waiter-delete-btn"
                          onClick={() => handleRemove(item.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Active Cooking Notes Tags */}
                    {item.notes && item.notes.length > 0 && (
                      <div className="item-notes-tags-row">
                        {item.notes.map((note, idx) => (
                          <span key={idx} className="item-note-tag">
                            📝 {note}
                            <button
                              className="note-tag-remove"
                              onClick={() => handleToggleNote(item.id, note)}
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Note Toggle Button */}
                    <div className="item-note-action-row">
                      <button
                        className={`item-add-note-btn ${isNotesOpen ? 'open' : ''}`}
                        onClick={() =>
                          setActiveItemForNote(isNotesOpen ? null : item.id)
                        }
                      >
                        <MessageSquare size={13} />
                        <span>
                          {isNotesOpen ? 'Close Notes' : '+ Cooking Notes'}
                        </span>
                      </button>
                    </div>

                    {/* Quick Notes Selector Box */}
                    {isNotesOpen && (
                      <div className="waiter-quick-notes-panel">
                        <span className="quick-notes-label">
                          Select Special Instruction:
                        </span>
                        <div className="quick-notes-cloud">
                          {QUICK_NOTES.map((qNote) => {
                            const isAdded = item.notes?.includes(qNote);
                            return (
                              <button
                                key={qNote}
                                className={`quick-note-chip ${
                                  isAdded ? 'active' : ''
                                }`}
                                onClick={() =>
                                  handleToggleNote(item.id, qNote)
                                }
                              >
                                {isAdded ? '✓ ' : '+ '}
                                {qNote}
                              </button>
                            );
                          })}
                        </div>
                        <div className="custom-note-input-row">
                          <input
                            type="text"
                            placeholder="Custom instruction..."
                            value={customNoteInput}
                            onChange={(e) =>
                              setCustomNoteInput(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleAddCustomNote(item.id);
                              }
                            }}
                          />
                          <button
                            onClick={() => handleAddCustomNote(item.id)}
                            className="custom-note-add-btn"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Waiter Order Summary & KOT Button */}
          <div className="waiter-order-footer">
            <div className="waiter-summary-row">
              <span className="waiter-summary-label">Estimated Bill:</span>
              <span className="waiter-summary-total">₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="waiter-actions-grid">
              <button
                className="waiter-punch-kot-btn"
                disabled={waiterOrder.length === 0}
                onClick={handlePunchKOT}
              >
                <Flame size={20} className="flame-kot-icon" />
                <div className="punch-btn-text">
                  <span className="punch-main-title">🔥 Send KOT to Kitchen</span>
                  <span className="punch-sub-title">
                    Punch Table {selectedTable.id} Order
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KOT Generated Modal / Ticket */}
      {kotSuccessTicket && (
        <div className="pos-modal-overlay">
          <div className="pos-modal-card kot-success-card">
            <div className="kot-ticket-header">
              <div className="kot-stamp">
                <ChefHat size={24} color="#5025d1" />
                <div>
                  <h3 className="kot-ticket-heading">KITCHEN ORDER TICKET</h3>
                  <span className="kot-ticket-sub">
                    TastyBite Restaurant • Live KOT
                  </span>
                </div>
              </div>
              <div className="kot-number-badge">
                <span>{kotSuccessTicket.kotNo}</span>
              </div>
            </div>

            <div className="kot-ticket-meta-grid">
              <div>
                <strong>Table:</strong> {kotSuccessTicket.table} (
                {kotSuccessTicket.area})
              </div>
              <div>
                <strong>Pax:</strong> {kotSuccessTicket.guests} Guests
              </div>
              <div>
                <strong>Waiter:</strong> {kotSuccessTicket.waiter}
              </div>
              <div>
                <strong>Time:</strong> {kotSuccessTicket.time}
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
                  {kotSuccessTicket.items.map((i, idx) => (
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
                ₹{kotSuccessTicket.totalAmount.toFixed(2)}
              </strong>
            </div>

            <div className="kot-action-buttons">
              <button
                className="kot-done-btn"
                onClick={handleFinishKOT}
              >
                <CheckCircle2 size={18} />
                <span>KOT Sent Successfully (Done)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
