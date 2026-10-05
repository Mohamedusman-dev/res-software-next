import React, { useState } from 'react';
import {
  Armchair,
  Users,
  Trash2,
  Minus,
  Plus,
  Tag,
  CreditCard,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { TABLES } from '../data/menuData';

export default function OrderPanel({
  orderItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearOrder,
  onOpenDiscount,
  onProceedToPayment,
  currentTable,
  setCurrentTable,
  discountPercent = 0
}) {
  const [isTableDropdownOpen, setIsTableDropdownOpen] = useState(false);

  // Subtotal calculation
  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Discount calculation
  const discountAmount = (subtotal * discountPercent) / 100;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);

  // GST 5%
  const gstRate = 0.05;
  const gst = discountedSubtotal * gstRate;

  // Final Total
  const total = discountedSubtotal + gst;

  const selectedTableObj =
    TABLES.find((t) => t.id === currentTable) || TABLES[0];

  return (
    <aside className="pos-order-panel">
      {/* Table Information & Status Row */}
      <div className="table-info-bar">
        {/* Table Selector Dropdown */}
        <div className="table-dropdown-wrapper">
          <button
            className="table-selector-btn"
            onClick={() => setIsTableDropdownOpen(!isTableDropdownOpen)}
          >
            <Armchair size={17} />
            <span className="table-name-label">{selectedTableObj.id}</span>
            <ChevronDown size={16} />
          </button>

          {isTableDropdownOpen && (
            <div className="table-dropdown-menu">
              <div className="table-dropdown-header">Select Dining Table</div>
              {TABLES.map((table) => (
                <div
                  key={table.id}
                  className={`table-option-row ${table.id === currentTable ? 'selected' : ''}`}
                  onClick={() => {
                    setCurrentTable(table.id);
                    setIsTableDropdownOpen(false);
                  }}
                >
                  <span className="table-opt-name">{table.name}</span>
                  <span className="table-opt-capacity">👥 {table.guests}</span>
                  <span className={`table-opt-status ${table.status.toLowerCase()}`}>
                    {table.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Guest Count Pill */}
        <div className="guest-count-pill">
          <Users size={16} />
          <span>{selectedTableObj.guests}</span>
        </div>

        {/* Table Status Pill */}
        <div className="table-status-pill occupied">
          <span className="status-dot"></span>
          <span>{selectedTableObj.status}</span>
        </div>
      </div>

      {/* Current Order Header */}
      <div className="order-section-header">
        <h3 className="order-title">Current Order</h3>
        {orderItems.length > 0 && (
          <button className="clear-order-btn" onClick={onClearOrder}>
            <Trash2 size={15} />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Order Items Scrollable Container */}
      <div className="order-items-list">
        {orderItems.length === 0 ? (
          <div className="empty-order-state">
            <span className="empty-order-emoji">🍽️</span>
            <p className="empty-order-text">No items in current order</p>
            <span className="empty-order-hint">
              Tap any dish from the menu to add to billing
            </span>
          </div>
        ) : (
          orderItems.map((item) => (
            <div key={item.id} className="order-item-row">
              {/* Thumbnail */}
              <div className="order-item-thumb">
                <img
                  src={item.image}
                  alt={item.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/mr-mango-logo.png';
                  }}
                />
              </div>

              {/* Details: Name & Price */}
              <div className="order-item-meta">
                <h4 className="order-item-name">{item.name}</h4>
                <span className="order-item-price">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>

              {/* Stepper Controls */}
              <div className="order-qty-stepper">
                <button
                  className="stepper-btn minus"
                  onClick={() => onUpdateQuantity(item.id, -1)}
                  title="Decrease"
                >
                  <Minus size={13} strokeWidth={2.5} />
                </button>
                <span className="stepper-val">{item.quantity}</span>
                <button
                  className="stepper-btn plus"
                  onClick={() => onUpdateQuantity(item.id, 1)}
                  title="Increase"
                >
                  <Plus size={13} strokeWidth={2.5} />
                </button>
              </div>

              {/* Delete Icon */}
              <button
                className="order-item-delete-btn"
                onClick={() => onRemoveItem(item.id)}
                title="Remove Item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Bill Summary Section */}
      <div className="order-summary-box">
        <div className="summary-row">
          <span className="summary-label">Subtotal</span>
          <span className="summary-value">₹{subtotal.toFixed(2)}</span>
        </div>

        {discountPercent > 0 && (
          <div className="summary-row discount-row">
            <span className="summary-label">Discount ({discountPercent}%)</span>
            <span className="summary-value">-₹{discountAmount.toFixed(2)}</span>
          </div>
        )}

        <div className="summary-row">
          <span className="summary-label">GST (5%)</span>
          <span className="summary-value">₹{gst.toFixed(2)}</span>
        </div>

        <div className="summary-divider"></div>

        <div className="summary-total-row">
          <span className="total-label">Total</span>
          <span className="total-amount">₹{total.toFixed(2)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="order-actions-container">
        <button className="apply-discount-btn" onClick={onOpenDiscount}>
          <div className="discount-icon-circle">
            <Tag size={15} />
          </div>
          <span className="discount-btn-text">
            {discountPercent > 0
              ? `Discount Applied (${discountPercent}%)`
              : 'Apply Discount'}
          </span>
          <ChevronRight size={18} className="discount-chevron" />
        </button>

        <button
          className="proceed-payment-btn"
          disabled={orderItems.length === 0}
          onClick={onProceedToPayment}
        >
          <CreditCard size={20} />
          <span className="payment-btn-text">Proceed to Payment</span>
          <ChevronRight size={20} />
        </button>
      </div>
    </aside>
  );
}
