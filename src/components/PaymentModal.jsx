import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Banknote,
  QrCode,
  Printer,
  CheckCircle2,
  Receipt,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PaymentModal({
  isOpen,
  onClose,
  orderItems,
  tableId,
  subtotal,
  discountPercent,
  discountAmount,
  gst,
  total,
  onPaymentSuccess
}) {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashTendered, setCashTendered] = useState(Math.ceil(total || 0));
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const changeDue = Math.max(0, (cashTendered || 0) - (total || 0));

  const handleCompletePayment = () => {
    setIsCompleted(true);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // fallback
    }
  };

  const handleFinishAndReset = () => {
    onPaymentSuccess();
    onClose();
    setIsCompleted(false);
  };

  const receiptNumber = 'MM-' + Math.floor(100000 + Math.random() * 900000);
  const orderTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const orderDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="payment-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Receipt size={22} className="modal-title-icon" />
            <div>
              <h3>Process Payment</h3>
              <p className="modal-subtitle">Table: {tableId} • Total Amount: <strong>₹{total.toFixed(2)}</strong></p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {!isCompleted ? (
          <div className="modal-body payment-body">
            {/* Payment Method Selector */}
            <div className="payment-methods-grid">
              <button
                className={`pay-method-card ${paymentMethod === 'cash' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('cash')}
              >
                <Banknote size={26} />
                <span>Cash</span>
              </button>
              <button
                className={`pay-method-card ${paymentMethod === 'card' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                <CreditCard size={26} />
                <span>Credit / Debit</span>
              </button>
              <button
                className={`pay-method-card ${paymentMethod === 'upi' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('upi')}
              >
                <QrCode size={26} />
                <span>UPI / QR</span>
              </button>
            </div>

            {/* Method Details */}
            {paymentMethod === 'cash' && (
              <div className="cash-payment-form">
                <label className="form-field-label">Cash Received (₹)</label>
                <div className="cash-input-row">
                  <input
                    type="number"
                    step="10"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(parseFloat(e.target.value) || 0)}
                    className="cash-input"
                  />
                  <div className="quick-cash-chips">
                    {[Math.ceil(total), 500, 1000, 2000].map((amt) => (
                      <button
                        key={amt}
                        className="quick-chip-btn"
                        onClick={() => setCashTendered(amt)}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="change-due-box">
                  <span>Change to Return:</span>
                  <span className="change-due-amount">₹{changeDue.toFixed(2)}</span>
                </div>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="card-payment-view">
                <div className="card-mock-machine">
                  <CreditCard size={48} color="#5025d1" />
                  <h4>Waiting for Card Tap or Swipe</h4>
                  <p>Terminal ready for Contactless, Chip or Swipe payment</p>
                </div>
              </div>
            )}

            {paymentMethod === 'upi' && (
              <div className="upi-payment-view">
                <div className="qr-box">
                  <QrCode size={110} color="#110d3a" />
                  <span>Scan to pay with any UPI App</span>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="modal-footer">
              <button className="secondary-modal-btn" onClick={onClose}>
                Cancel
              </button>
              <button
                className="primary-pay-confirm-btn"
                onClick={handleCompletePayment}
              >
                <span>Confirm & Pay ₹{total.toFixed(2)}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="modal-body success-body">
            <div className="success-banner">
              <CheckCircle2 size={56} className="success-icon" />
              <h3>Payment Completed!</h3>
              <p>Receipt #{receiptNumber} has been generated.</p>
            </div>

            {/* Thermal Receipt Preview */}
            <div className="thermal-receipt">
              <div className="receipt-brand">
                <img src="/mr-mango-logo.png" alt="Mr. Mango" className="receipt-logo" />
                <h4>Mr. Mango Restaurant</h4>
                <p>Delight in Every Bite • Delicious Food</p>
                <p>Tax Invoice: #{receiptNumber}</p>
                <p>{orderDate} • {orderTime}</p>
              </div>

              <div className="receipt-divider"></div>

              <div className="receipt-items-table">
                {orderItems.map((item) => (
                  <div key={item.id} className="receipt-row">
                    <span className="receipt-item-name">{item.name} x{item.quantity}</span>
                    <span className="receipt-item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="receipt-divider"></div>

              <div className="receipt-totals">
                <div className="receipt-row">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="receipt-row">
                    <span>Discount ({discountPercent}%):</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="receipt-row">
                  <span>GST (5%):</span>
                  <span>₹{gst.toFixed(2)}</span>
                </div>
                <div className="receipt-row receipt-grand-total">
                  <span>TOTAL:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="receipt-row">
                  <span>Payment Mode:</span>
                  <span className="uppercase">{paymentMethod}</span>
                </div>
              </div>

              <div className="receipt-footer">
                <p>Thank You For Dining With Us!</p>
                <p>Visit Again • Have A Great Day!</p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="secondary-modal-btn"
                onClick={() => window.print()}
              >
                <Printer size={18} />
                <span>Print Receipt</span>
              </button>
              <button
                className="primary-pay-confirm-btn"
                onClick={handleFinishAndReset}
              >
                <span>New Order</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
