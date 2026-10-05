import React, { useState } from 'react';
import {
  Search,
  ShoppingBag,
  Wallet,
  CreditCard,
  Receipt,
  RotateCcw,
  Smartphone,
  WalletCards,
  MoreHorizontal,
  ShoppingCart,
  Printer,
  Send,
  Plus,
  CheckCircle2
} from 'lucide-react';

const INITIAL_ORDERS = [
  {
    id: '#ORD-ORD-00160',
    type: 'Dine In',
    table: 'Table TT6',
    itemsCount: 1,
    timeAgo: '75d ago',
    date: '19 Jul 2026',
    time: '07:46 pm',
    subtotal: 110.0,
    cgst: 2.75,
    sgst: 2.75,
    total: 130.0,
    items: [
      {
        id: 'i1',
        name: 'Blueberry Milkshake Float',
        img: '/food/login-feast.jpg',
        qty: 1,
        price: 110.0,
        total: 110.0
      }
    ]
  },
  {
    id: '#ORD-ORD-00159',
    type: 'Dine In',
    table: 'Table TT3',
    itemsCount: 1,
    timeAgo: '75d ago',
    date: '19 Jul 2026',
    time: '07:32 pm',
    subtotal: 104.76,
    cgst: 2.62,
    sgst: 2.62,
    total: 110.0,
    items: [
      {
        id: 'i2',
        name: 'Special Chicken Biryani',
        img: '/food/biryani.jpg',
        qty: 1,
        price: 104.76,
        total: 104.76
      }
    ]
  },
  {
    id: '#ORD-ORD-00158',
    type: 'Dine In',
    table: 'Table TT7',
    itemsCount: 3,
    timeAgo: '95d ago',
    date: '15 May 2026',
    time: '01:15 pm',
    subtotal: 276.19,
    cgst: 6.9,
    sgst: 6.9,
    total: 290.0,
    items: [
      { id: 'i3', name: 'Paneer Butter Masala', img: '/food/paneer-pizza.jpg', qty: 1, price: 180.0, total: 180.0 },
      { id: 'i4', name: 'Butter Naan Basket', img: '/food/dosa.jpg', qty: 2, price: 48.09, total: 96.19 }
    ]
  },
  {
    id: '#ORD-ORD-00155',
    type: 'Dine In',
    table: 'Table TT4',
    itemsCount: 2,
    timeAgo: '95d ago',
    date: '15 May 2026',
    time: '01:40 pm',
    subtotal: 295.24,
    cgst: 7.38,
    sgst: 7.38,
    total: 310.0,
    items: [
      { id: 'i5', name: 'Mutton Sukka Roast', img: '/food/biryani.jpg', qty: 1, price: 220.0, total: 220.0 },
      { id: 'i6', name: 'Fresh Mango Lassi', img: '/food/lime.jpg', qty: 1, price: 75.24, total: 75.24 }
    ]
  },
  {
    id: '#ORD-ORD-00149',
    type: 'Takeaway',
    table: 'Table TT2',
    itemsCount: 1,
    timeAgo: '96d ago',
    date: '14 May 2026',
    time: '08:10 pm',
    subtotal: 228.57,
    cgst: 5.71,
    sgst: 5.71,
    total: 240.0,
    items: [{ id: 'i7', name: 'Chicken Fried Rice', img: '/food/chicken-rice.jpg', qty: 1, price: 228.57, total: 228.57 }]
  },
  {
    id: '#ORD-ORD-00147',
    type: 'Delivery',
    table: 'Table TT1',
    itemsCount: 1,
    timeAgo: '98d ago',
    date: '12 May 2026',
    time: '09:05 pm',
    subtotal: 238.1,
    cgst: 5.95,
    sgst: 5.95,
    total: 250.0,
    items: [{ id: 'i8', name: 'Crispy Veg Burger', img: '/food/burger.jpg', qty: 2, price: 119.05, total: 238.1 }]
  }
];

const RECENT_PAYMENTS_DATA = [
  { id: '#PAY-ORD-00160', method: 'UPI Payment', status: 'Completed', amount: 130.0, timeAgo: '75d ago' },
  { id: '#PAY-ORD-00155', method: 'UPI Payment', status: 'Completed', amount: 310.0, timeAgo: '95d ago' },
  { id: '#PAY-ORD-00150', method: 'UPI Payment', status: 'Completed', amount: 240.0, timeAgo: '96d ago' },
  { id: '#PAY-ORD-00149', method: 'UPI Payment', status: 'Completed', amount: 240.0, timeAgo: '96d ago' }
];

export default function PendingBills({ onSettleBill, onOpenPaymentModal }) {
  const [ordersList, setOrdersList] = useState(INITIAL_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState(INITIAL_ORDERS[0]);
  const [globalSearch, setGlobalSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState('Dine In'); // 'Dine In', 'Takeaway', 'Delivery'
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // 'Cash', 'UPI', 'Card', 'Wallet', 'Others'
  const [receivedAmount, setReceivedAmount] = useState('');
  const [recentPayments, setRecentPayments] = useState(RECENT_PAYMENTS_DATA);

  // Filtered orders list
  const filteredOrders = ordersList.filter((ord) => {
    const matchType =
      orderTypeFilter === 'all' || ord.type.toLowerCase().includes(orderTypeFilter.toLowerCase());
    const matchSearch =
      !orderSearch.trim() ||
      ord.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      ord.table.toLowerCase().includes(orderSearch.toLowerCase());
    const matchGlobal =
      !globalSearch.trim() ||
      ord.id.toLowerCase().includes(globalSearch.toLowerCase()) ||
      ord.table.toLowerCase().includes(globalSearch.toLowerCase());
    return matchType && matchSearch && matchGlobal;
  });

  const calculateChange = () => {
    const num = parseFloat(receivedAmount);
    if (isNaN(num) || !selectedOrder) return '0.00';
    const diff = num - selectedOrder.total;
    return diff > 0 ? diff.toFixed(2) : '0.00';
  };

  const handleCollectPayment = () => {
    if (!selectedOrder) return;

    // Add to recent payments
    const newPayment = {
      id: `#PAY-${selectedOrder.id.replace('#', '')}`,
      method: `${paymentMethod} Payment`,
      status: 'Completed',
      amount: selectedOrder.total,
      timeAgo: 'Just now'
    };

    setRecentPayments((prev) => [newPayment, ...prev]);
    setOrdersList((prev) => prev.filter((o) => o.id !== selectedOrder.id));

    if (onSettleBill) onSettleBill(selectedOrder.id);

    alert(`Payment of ₹${selectedOrder.total.toFixed(2)} collected successfully via ${paymentMethod}!`);

    const remaining = ordersList.filter((o) => o.id !== selectedOrder.id);
    setSelectedOrder(remaining.length > 0 ? remaining[0] : null);
    setReceivedAmount('');
  };

  return (
    <div className="cashier-dashboard-root">
      {/* 1. Top Header Bar */}
      <div className="cd-top-header">
        <div className="cd-header-titles">
          <h1 className="cd-main-title">Cashier Dashboard</h1>
          <p className="cd-sub-title">
            Generate bills, collect payments & manage transactions
          </p>
        </div>

        <div className="cd-header-actions">
          <div className="cd-search-box">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search order ID, table, customer..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
            />
          </div>

          <div className="cd-cashier-pill">
            <div className="cd-avatar-circle">P</div>
            <div className="cd-cashier-meta">
              <span className="cd-cashier-name">Priya R.</span>
              <span className="cd-cashier-role">Cashier</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top 5 KPI Metric Cards */}
      <div className="cd-kpi-5grid">
        {/* Card 1: Today's Sales */}
        <div className="cd-kpi-card">
          <div className="kpi-icon-box purple">
            <ShoppingBag size={18} color="#ffffff" />
          </div>
          <div className="kpi-info-col">
            <span className="kpi-label">Today's Sales</span>
            <strong className="kpi-value">₹0.00</strong>
            <span className="kpi-trend green">📈 12.5% from yesterday</span>
          </div>
        </div>

        {/* Card 2: Cash Sales */}
        <div className="cd-kpi-card">
          <div className="kpi-icon-box green">
            <Wallet size={18} color="#ffffff" />
          </div>
          <div className="kpi-info-col">
            <span className="kpi-label">Cash Sales</span>
            <strong className="kpi-value">₹0.00</strong>
            <span className="kpi-trend green">📈 8.3% from yesterday</span>
          </div>
        </div>

        {/* Card 3: UPI/Card Sales */}
        <div className="cd-kpi-card">
          <div className="kpi-icon-box blue">
            <CreditCard size={18} color="#ffffff" />
          </div>
          <div className="kpi-info-col">
            <span className="kpi-label">UPI/Card Sales</span>
            <strong className="kpi-value">₹0.00</strong>
            <span className="kpi-trend green">📈 15.7% from yesterday</span>
          </div>
        </div>

        {/* Card 4: Pending Bills */}
        <div className="cd-kpi-card orange-card">
          <div className="kpi-icon-box orange">
            <Receipt size={18} color="#ffffff" />
          </div>
          <div className="kpi-info-col">
            <span className="kpi-label">Pending Bills</span>
            <strong className="kpi-value">{ordersList.length}</strong>
            <span className="kpi-link">↗ View pending orders</span>
          </div>
        </div>

        {/* Card 5: Refunds */}
        <div className="cd-kpi-card">
          <div className="kpi-icon-box red">
            <RotateCcw size={18} color="#ffffff" />
          </div>
          <div className="kpi-info-col">
            <span className="kpi-label">Refunds</span>
            <strong className="kpi-value">₹0.00</strong>
            <span className="kpi-trend green">📈 Today's total</span>
          </div>
        </div>
      </div>

      {/* 3. Main 3-Column Workspace Grid */}
      <div className="cd-workspace-grid">
        {/* Column 1: Orders List */}
        <div className="cd-orders-column">
          <div className="orders-header-row">
            <div className="orders-title-wrap">
              <h3 className="column-title">Orders</h3>
              <span className="orders-count-badge">{ordersList.length}</span>
            </div>
          </div>

          <div className="order-type-pills">
            <button
              className={`order-pill ${orderTypeFilter === 'Dine In' ? 'active' : ''}`}
              onClick={() => setOrderTypeFilter('Dine In')}
            >
              Dine In
            </button>
            <button
              className={`order-pill ${orderTypeFilter === 'Takeaway' ? 'active' : ''}`}
              onClick={() => setOrderTypeFilter('Takeaway')}
            >
              Takeaway
            </button>
            <button
              className={`order-pill ${orderTypeFilter === 'Delivery' ? 'active' : ''}`}
              onClick={() => setOrderTypeFilter('Delivery')}
            >
              Delivery
            </button>
          </div>

          <div className="orders-search-input-wrap">
            <Search size={15} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search order or table..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
            />
          </div>

          <div className="orders-scroll-list">
            {filteredOrders.length === 0 ? (
              <div className="no-orders-empty">
                <CheckCircle2 size={32} color="#10b981" />
                <span>No orders found</span>
              </div>
            ) : (
              filteredOrders.map((ord) => {
                const isSelected = selectedOrder?.id === ord.id;
                return (
                  <div
                    key={ord.id}
                    className={`order-card-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedOrder(ord)}
                  >
                    <div className="card-left-col">
                      <span className="order-card-id">{ord.id}</span>
                      <div className="order-card-subrow">
                        <span className="dine-tag green">{ord.type}</span>
                        <span className="table-meta">
                          {ord.table} • {ord.itemsCount} items
                        </span>
                      </div>
                    </div>

                    <div className="card-right-col">
                      <strong className="order-card-price">
                        ₹{ord.total.toFixed(2)}
                      </strong>
                      <span className="order-card-time">{ord.timeAgo}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <button className="view-all-orders-btn">View All Orders</button>
        </div>

        {/* Column 2: Order Details */}
        <div className="cd-details-column">
          {selectedOrder ? (
            <div className="details-inner-card">
              <div className="details-header-row">
                <div>
                  <h3 className="column-title">Order Details</h3>
                  <div className="details-tags-line">
                    <span className="dine-tag green">{selectedOrder.type}</span>
                    <span className="details-table-label">
                      • {selectedOrder.table}
                    </span>
                  </div>
                  <span className="details-ord-id">{selectedOrder.id}</span>
                </div>

                <div className="details-time-box">
                  <span>🕒 {selectedOrder.time}</span>
                  <span>{selectedOrder.date}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="details-table-wrapper">
                <table className="cd-items-table">
                  <thead>
                    <tr>
                      <th>ITEM</th>
                      <th style={{ textAlign: 'center' }}>QTY</th>
                      <th style={{ textAlign: 'right' }}>PRICE</th>
                      <th style={{ textAlign: 'right' }}>TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="item-cell-with-img">
                            <img
                              src={item.img || '/food/biryani.jpg'}
                              alt={item.name}
                              className="item-thumb-img"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/food/biryani.jpg';
                              }}
                            />
                            <span className="item-cell-name">{item.name}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: '600' }}>
                          {item.qty}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          ₹{item.price.toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: '700' }}>
                          ₹{item.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <button className="add-item-dashed-btn">
                  <Plus size={14} /> Add Item
                </button>
              </div>

              {/* Summary Breakdown */}
              <div className="details-calc-summary">
                <div className="calc-item-row">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="calc-item-row">
                  <span>CGST (2.5%)</span>
                  <span>₹{selectedOrder.cgst.toFixed(2)}</span>
                </div>
                <div className="calc-item-row">
                  <span>SGST (2.5%)</span>
                  <span>₹{selectedOrder.sgst.toFixed(2)}</span>
                </div>

                <div className="calc-total-banner">
                  <span>Total Amount</span>
                  <strong className="total-big-val">
                    ₹{selectedOrder.total.toFixed(2)}
                  </strong>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="details-action-3btn">
                <button className="cd-purple-btn">Apply Discount</button>
                <button className="cd-outline-btn">Split Bill</button>
                <button className="cd-outline-btn">Add Note</button>
              </div>
            </div>
          ) : (
            <div className="no-order-selected">
              <Receipt size={40} color="#94a3b8" />
              <h3>Select an Order</h3>
              <p>Choose an active order from the left list to view details.</p>
            </div>
          )}
        </div>

        {/* Column 3: Payment Summary & Collect */}
        <div className="cd-payment-column">
          <div className="payment-summary-card">
            <h3 className="column-title">Payment Summary</h3>

            <div className="payment-total-row">
              <span>Total Amount</span>
              <strong className="pay-total-val">
                ₹{(selectedOrder?.total || 0).toFixed(2)}
              </strong>
            </div>

            <span className="pay-method-label">Payment Method</span>
            <div className="payment-methods-grid">
              <button
                className={`pay-method-btn ${paymentMethod === 'Cash' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('Cash')}
              >
                <div className="pay-icon-box green">
                  <Wallet size={16} color="#059669" />
                </div>
                <span>Cash</span>
              </button>

              <button
                className={`pay-method-btn ${paymentMethod === 'UPI' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('UPI')}
              >
                <div className="pay-icon-box purple">
                  <Smartphone size={16} color="#7c3aed" />
                </div>
                <span>UPI</span>
              </button>

              <button
                className={`pay-method-btn ${paymentMethod === 'Card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('Card')}
              >
                <div className="pay-icon-box red">
                  <CreditCard size={16} color="#ef4444" />
                </div>
                <span>Card</span>
              </button>

              <button
                className={`pay-method-btn ${paymentMethod === 'Wallet' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('Wallet')}
              >
                <div className="pay-icon-box blue">
                  <WalletCards size={16} color="#2563eb" />
                </div>
                <span>Wallet</span>
              </button>

              <button
                className={`pay-method-btn ${paymentMethod === 'Others' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('Others')}
              >
                <div className="pay-icon-box gray">
                  <MoreHorizontal size={16} color="#475569" />
                </div>
                <span>Others</span>
              </button>
            </div>

            <div className="received-amount-field">
              <label>Received Amount</label>
              <div className="input-currency-wrap">
                <span>₹</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="change-output-row">
              <span>Change</span>
              <strong className="change-green-val">
                ₹{calculateChange()}
              </strong>
            </div>

            {/* Collect Payment Yellow Button */}
            <button
              className="collect-payment-yellow-btn"
              onClick={handleCollectPayment}
              disabled={!selectedOrder}
            >
              <ShoppingCart size={18} />
              <span>Collect Payment</span>
            </button>

            <div className="print-send-2btn">
              <button
                className="cd-sub-act-btn"
                onClick={() => alert(`Printing Bill for ${selectedOrder?.id}`)}
              >
                <Printer size={15} />
                <span>Print Bill</span>
              </button>
              <button
                className="cd-sub-act-btn"
                onClick={() => alert(`Sending Bill for ${selectedOrder?.id}`)}
              >
                <Send size={15} />
                <span>Send Bill</span>
              </button>
            </div>
          </div>

          {/* Bottom Recent Payments List */}
          <div className="recent-payments-card">
            <div className="recent-pay-header">
              <h4 className="recent-pay-title">Recent Payments</h4>
              <span className="view-all-link">View All</span>
            </div>

            <div className="recent-payments-list">
              {recentPayments.map((pay, idx) => (
                <div key={idx} className="recent-pay-row">
                  <div className="recent-pay-left">
                    <strong className="recent-pay-id">{pay.id}</strong>
                    <div className="recent-pay-meta">
                      <span>{pay.method}</span>
                      <span className="completed-tag">{pay.status}</span>
                    </div>
                  </div>
                  <div className="recent-pay-right">
                    <strong className="recent-pay-amt">
                      ₹{pay.amount.toFixed(2)}
                    </strong>
                    <span className="recent-pay-time">{pay.timeAgo}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
