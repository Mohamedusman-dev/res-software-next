import React, { useState } from 'react';
import { X, Tag, Plus, Barcode } from 'lucide-react';

export function DiscountModal({ isOpen, onClose, currentDiscount, onApplyDiscount }) {
  const [selectedPercent, setSelectedPercent] = useState(currentDiscount || 10);
  const [couponCode, setCouponCode] = useState('');

  if (!isOpen) return null;

  const discountPresets = [5, 10, 15, 20, 25];

  const handleApply = () => {
    onApplyDiscount(selectedPercent);
    onClose();
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'MANGO20') {
      setSelectedPercent(20);
      onApplyDiscount(20);
      onClose();
    } else if (couponCode.toUpperCase() === 'MANGO10') {
      setSelectedPercent(10);
      onApplyDiscount(10);
      onClose();
    } else {
      alert('Invalid coupon! Try MANGO10 or MANGO20');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="compact-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Tag size={20} className="modal-title-icon" />
            <div>
              <h3>Apply Order Discount</h3>
              <p className="modal-subtitle">Select percentage or enter promo code</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <label className="form-field-label">Select Discount Percentage</label>
          <div className="discount-chips-row">
            {discountPresets.map((pct) => (
              <button
                key={pct}
                type="button"
                className={`discount-chip-btn ${selectedPercent === pct ? 'selected' : ''}`}
                onClick={() => setSelectedPercent(pct)}
              >
                {pct}% OFF
              </button>
            ))}
          </div>

          <form onSubmit={handleApplyCoupon} className="coupon-form">
            <label className="form-field-label">Have a Promo Coupon?</label>
            <div className="coupon-input-group">
              <input
                type="text"
                placeholder="Enter MANGO10 or MANGO20"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="coupon-input"
              />
              <button type="submit" className="coupon-apply-btn">
                Apply Code
              </button>
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button className="secondary-modal-btn" onClick={() => onApplyDiscount(0) || onClose()}>
            Remove Discount
          </button>
          <button className="primary-pay-confirm-btn" onClick={handleApply}>
            Save Discount
          </button>
        </div>
      </div>
    </div>
  );
}

export function CustomItemModal({ isOpen, onClose, onAddCustomItem }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('starters');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price) return;
    onAddCustomItem({
      name,
      price: parseFloat(price),
      category,
      image: '/food/promo-dish.jpg'
    });
    setName('');
    setPrice('');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="compact-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Plus size={20} className="modal-title-icon" />
            <div>
              <h3>Add Custom Item</h3>
              <p className="modal-subtitle">Quickly add an off-menu item to order</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-field-label">Item / Dish Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Mango Special Sundae"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-field-label">Price (₹)</label>
              <input
                type="number"
                step="1"
                required
                placeholder="150"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-field-label">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-select"
              >
                <option value="starters">Starters</option>
                <option value="main">Main Course</option>
                <option value="beverages">Beverages</option>
                <option value="desserts">Desserts</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="secondary-modal-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-pay-confirm-btn">
              Add to Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function BarcodeModal({ isOpen, onClose, onBarcodeFound, menuItems }) {
  if (!isOpen) return null;

  const handleSimulateScan = (code) => {
    const item = menuItems.find((i) => i.code === code);
    if (item) {
      onBarcodeFound(item);
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="compact-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Barcode size={20} className="modal-title-icon" />
            <div>
              <h3>Barcode Scanner</h3>
              <p className="modal-subtitle">Ready to scan item barcode or SKU</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body text-center">
          <div className="scanner-animation-box">
            <div className="scanner-laser-line"></div>
            <Barcode size={72} strokeWidth={1.5} color="#5025d1" />
          </div>
          <p className="scanner-help-text">Point barcode scanner at product tag</p>

          <div className="quick-scan-demo-list">
            <span className="demo-label">Quick Scan Simulation:</span>
            <div className="quick-scan-buttons">
              <button
                className="quick-scan-btn"
                onClick={() => handleSimulateScan('CB01')}
              >
                Scan Chicken Biryani (CB01)
              </button>
              <button
                className="quick-scan-btn"
                onClick={() => handleSimulateScan('HN03')}
              >
                Scan Hakka Noodles (HN03)
              </button>
              <button
                className="quick-scan-btn"
                onClick={() => handleSimulateScan('FL12')}
              >
                Scan Fresh Lime (FL12)
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="secondary-modal-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
