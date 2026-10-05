import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MenuSection from './components/MenuSection';
import OrderPanel from './components/OrderPanel';
import WaiterPanel from './components/WaiterPanel';
import PendingBills from './components/PendingBills';
import MenuManagement from './components/MenuManagement';
import PaymentModal from './components/PaymentModal';
import LoginPage from './components/LoginPage';
import LoginModal from './components/LoginModal';
import { DiscountModal, CustomItemModal, BarcodeModal } from './components/Modals';
import { INITIAL_MENU_ITEMS, INITIAL_ORDER } from './data/menuData';
import { ChefHat, Armchair, BarChart3, Settings } from 'lucide-react';
import { subscribeToLiveSync } from './lib/supabase';

import MobileWaiterApp from './components/MobileWaiterApp';

export default function App() {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [activeNav, setActiveNav] = useState('cashier');
  const [menuItems, setMenuItems] = useState(INITIAL_MENU_ITEMS);
  const [orderItems, setOrderItems] = useState(INITIAL_ORDER);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [headerSearch, setHeaderSearch] = useState('');
  const [currentTable, setCurrentTable] = useState('A1');
  const [discountPercent, setDiscountPercent] = useState(0);

  // Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [isCustomItemOpen, setIsCustomItemOpen] = useState(false);
  const [isBarcodeOpen, setIsBarcodeOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  // Live Supabase & Realtime Sync Subscription
  useEffect(() => {
    const unsubscribe = subscribeToLiveSync((data) => {
      if (data.type === 'KOT_PUNCHED') {
        const kot = data.payload;
        showToast(`🔥 Realtime Live KOT #${kot.kotNo || ''} received for ${kot.table || 'Table'}!`);
      }
    });

    return () => unsubscribe();
  }, []);

  // Full Login from LoginPage
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    if (user.defaultTab) {
      setActiveNav(user.defaultTab);
    }
    showToast(`Welcome back, ${user.name}!`);
  };

  // Staff switch from Modal
  const handleSwitchUser = (user) => {
    setCurrentUser(user);
    if (user.defaultTab) {
      setActiveNav(user.defaultTab);
    }
    showToast(`Switched user to ${user.name}`);
  };

  // Logout action
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out from POS?')) {
      setIsLoggedIn(false);
      setCurrentUser(null);
      setOrderItems([]);
    }
  };

  // Add Item to Order
  const handleAddToCart = (item) => {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        return [
          ...prev,
          {
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
            image: item.image,
          },
        ];
      }
    });
    showToast(`Added ${item.name} to order`);
  };

  // Update item quantity
  const handleUpdateQuantity = (id, delta) => {
    setOrderItems((prev) => {
      return prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  // Remove Item
  const handleRemoveItem = (id) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== id));
    showToast('Item removed from order');
  };

  // Clear Order
  const handleClearOrder = () => {
    if (window.confirm('Are you sure you want to clear all items in the current order?')) {
      setOrderItems([]);
      showToast('Order cleared');
    }
  };

  // Add Custom Item
  const handleAddCustomItem = (newItem) => {
    const itemWithId = {
      ...newItem,
      id: Date.now(),
      hasStar: false,
    };
    setMenuItems((prev) => [itemWithId, ...prev]);
    handleAddToCart(itemWithId);
    showToast(`New dish ${newItem.name} created!`);
  };

  // Barcode found
  const handleBarcodeFound = (item) => {
    handleAddToCart(item);
  };

  // Payment success
  const handlePaymentSuccess = () => {
    setOrderItems([]);
    setDiscountPercent(0);
    showToast('Payment successful! Order processed.');
  };

  // Waiter KOT Sent
  const handleSendKOT = (kotData) => {
    showToast(`🔥 KOT ${kotData.kotNo} sent to Kitchen for ${kotData.table}!`);
  };

  // Combined search: header search or sub search
  const effectiveSearch = headerSearch || searchFilter;

  // Calculation for payment modal
  const subtotal = useMemo(
    () => orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [orderItems]
  );
  const discountAmount = (subtotal * discountPercent) / 100;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const gst = discountedSubtotal * 0.05;
  const total = discountedSubtotal + gst;

  // If not logged in, render the exact TastyBite Login Screen
  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // If logged in as Waiter, render the Dedicated Mobile Waiter App Interface
  if (currentUser?.role === 'waiter') {
    return (
      <MobileWaiterApp
        menuItems={menuItems}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />
    );
  }

  return (
    <div className="pos-app-container">
      {/* 1. Left Sidebar */}
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* 2. Main Right Area */}
      <div className="pos-main-wrapper">
        {/* Top Header */}
        <Header
          searchTerm={headerSearch}
          setSearchTerm={setHeaderSearch}
          onOpenSettings={() => setActiveNav('settings')}
          activeNav={activeNav}
          currentUser={currentUser}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Dynamic Workspace based on Active Navigation Tab */}
        {activeNav === 'cashier' ? (
          <main className="pos-workspace">
            {/* Center Menu Grid & Categories */}
            <MenuSection
              menuItems={menuItems}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              searchFilter={effectiveSearch}
              setSearchFilter={setSearchFilter}
              onAddToCart={handleAddToCart}
              onOpenBarcode={() => setIsBarcodeOpen(true)}
              onOpenCustomItem={() => setIsCustomItemOpen(true)}
            />

            {/* Right Order & Billing Panel */}
            <OrderPanel
              orderItems={orderItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearOrder={handleClearOrder}
              onOpenDiscount={() => setIsDiscountOpen(true)}
              onProceedToPayment={() => setIsPaymentOpen(true)}
              currentTable={currentTable}
              setCurrentTable={setCurrentTable}
              discountPercent={discountPercent}
            />
          </main>
        ) : activeNav === 'waiter' ? (
          <main className="pos-workspace waiter-workspace-mode">
            <WaiterPanel
              menuItems={menuItems}
              currentUser={currentUser}
              onSendKOT={handleSendKOT}
              onOpenLogin={() => setIsLoginModalOpen(true)}
            />
          </main>
        ) : activeNav === 'pending' ? (
          <main className="pos-workspace pending-workspace-mode">
            <PendingBills
              onSettleBill={(id) => showToast(`Bill ${id} settled!`)}
              onOpenPaymentModal={() => setIsPaymentOpen(true)}
            />
          </main>
        ) : activeNav === 'menu' ? (
          <main className="pos-workspace menu-workspace-mode">
            <MenuManagement
              menuItems={menuItems}
              setMenuItems={setMenuItems}
              onOpenCustomItem={() => setIsCustomItemOpen(true)}
            />
          </main>
        ) : (
          /* Placeholder views for other tabs with direct return */
          <div className="pos-workspace">
            <div className="placeholder-view-container">
              {activeNav === 'tables' && <Armchair size={54} color="#4f27d9" />}
              {activeNav === 'kitchen' && <ChefHat size={54} color="#4f27d9" />}
              {activeNav === 'reports' && <BarChart3 size={54} color="#4f27d9" />}
              {activeNav === 'settings' && <Settings size={54} color="#4f27d9" />}

              <h2>
                {activeNav.charAt(0).toUpperCase() + activeNav.slice(1)} Module
              </h2>
              <p>
                TastyBite Restaurant Management System integrates {activeNav} in real time with active Cashier and Waiter stations.
              </p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button
                  className="primary-pay-confirm-btn"
                  onClick={() => setActiveNav('cashier')}
                >
                  Return to Take Away / Cashier
                </button>
                <button
                  className="primary-pay-confirm-btn secondary"
                  style={{ background: '#f3f4f6', color: '#1f2937' }}
                  onClick={() => setActiveNav('waiter')}
                >
                  Go to Waiter Panel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Staff Switch / Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        onLoginUser={handleSwitchUser}
      />

      {/* Payment Checkout Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        orderItems={orderItems}
        tableId={currentTable}
        subtotal={subtotal}
        discountPercent={discountPercent}
        discountAmount={discountAmount}
        gst={gst}
        total={total}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Discount Modal */}
      <DiscountModal
        isOpen={isDiscountOpen}
        onClose={() => setIsDiscountOpen(false)}
        currentDiscount={discountPercent}
        onApplyDiscount={(val) => {
          setDiscountPercent(val);
          showToast(val > 0 ? `Applied ${val}% discount!` : 'Discount removed');
        }}
      />

      {/* Custom Item Modal */}
      <CustomItemModal
        isOpen={isCustomItemOpen}
        onClose={() => setIsCustomItemOpen(false)}
        onAddCustomItem={handleAddCustomItem}
      />

      {/* Barcode Scanner Simulation Modal */}
      <BarcodeModal
        isOpen={isBarcodeOpen}
        onClose={() => setIsBarcodeOpen(false)}
        menuItems={menuItems}
        onBarcodeFound={handleBarcodeFound}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="pos-toast">
          <span>✨ {toastMessage}</span>
        </div>
      )}
    </div>
  );
}
