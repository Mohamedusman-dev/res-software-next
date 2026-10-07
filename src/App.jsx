import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MenuSection from './components/MenuSection';
import OrderPanel from './components/OrderPanel';
import WaiterPanel from './components/WaiterPanel';
import PendingBills from './components/PendingBills';
import MenuManagement from './components/MenuManagement';
import TableManagement from './components/TableManagement';
import KitchenDisplaySystem from './components/KitchenDisplaySystem';
import PaymentModal from './components/PaymentModal';
import LoginPage from './components/LoginPage';
import LoginModal from './components/LoginModal';
import { DiscountModal, CustomItemModal, BarcodeModal } from './components/Modals';
import { INITIAL_MENU_ITEMS, INITIAL_ORDER } from './data/menuData';
import { BarChart3, Settings } from 'lucide-react';
import { subscribeToLiveSync } from './lib/supabase';

import MobileWaiterApp from './components/MobileWaiterApp';

export default function App() {
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

  useEffect(() => {
    const unsubscribe = subscribeToLiveSync((data) => {
      if (data.type === 'KOT_PUNCHED') {
        const kot = data.payload;
        showToast(`🔥 Realtime Live KOT #${kot.kotNo || ''} received for ${kot.table || 'Table'}!`);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    if (user.defaultTab) {
      setActiveNav(user.defaultTab);
    }
    showToast(`Welcome back, ${user.name}!`);
  };

  const handleSwitchUser = (user) => {
    setCurrentUser(user);
    if (user.defaultTab) {
      setActiveNav(user.defaultTab);
    }
    showToast(`Switched user to ${user.name}`);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out from POS?')) {
      setIsLoggedIn(false);
      setCurrentUser(null);
      setOrderItems([]);
    }
  };

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
          { id: item.id, name: item.name, price: item.price, quantity: 1, image: item.image },
        ];
      }
    });
    showToast(`Added ${item.name} to order`);
  };

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

  const handleRemoveItem = (id) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== id));
    showToast('Item removed from order');
  };

  const handleClearOrder = () => {
    if (window.confirm('Are you sure you want to clear all items in the current order?')) {
      setOrderItems([]);
      showToast('Order cleared');
    }
  };

  const handleAddCustomItem = (newItem) => {
    const itemWithId = { ...newItem, id: Date.now(), hasStar: false };
    setMenuItems((prev) => [itemWithId, ...prev]);
    handleAddToCart(itemWithId);
    showToast(`New dish ${newItem.name} created!`);
  };

  const handleBarcodeFound = (item) => {
    handleAddToCart(item);
  };

  const handlePaymentSuccess = () => {
    setOrderItems([]);
    setDiscountPercent(0);
    showToast('Payment successful! Order processed.');
  };

  const handleSendKOT = (kotData) => {
    showToast(`🔥 KOT ${kotData.kotNo} sent to Kitchen for ${kotData.table}!`);
  };

  const effectiveSearch = headerSearch || searchFilter;

  const subtotal = useMemo(
    () => orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [orderItems]
  );
  const discountAmount = (subtotal * discountPercent) / 100;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const gst = discountedSubtotal * 0.05;
  const total = discountedSubtotal + gst;

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

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

  if (activeNav === 'kitchen') {
    return (
      <>
        <KitchenDisplaySystem />
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          currentUser={currentUser}
          onLoginUser={handleSwitchUser}
        />
        {toastMessage && (
          <div className="pos-toast">
            <span>&#10024; {toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="pos-app-container">
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <div className="pos-main-wrapper">
        <Header
          searchTerm={headerSearch}
          setSearchTerm={setHeaderSearch}
          onOpenSettings={() => setActiveNav('settings')}
          activeNav={activeNav}
          currentUser={currentUser}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onLogout={handleLogout}
        />

        {activeNav === 'cashier' ? (
          <main className="pos-workspace">
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
        ) : activeNav === 'tables' ? (
          <main className="pos-workspace menu-workspace-mode">
            <TableManagement />
          </main>
        ) : (
          <div className="pos-workspace">
            <div className="placeholder-view-container">
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

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        onLoginUser={handleSwitchUser}
      />

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

      <DiscountModal
        isOpen={isDiscountOpen}
        onClose={() => setIsDiscountOpen(false)}
        currentDiscount={discountPercent}
        onApplyDiscount={(val) => {
          setDiscountPercent(val);
          showToast(val > 0 ? `Applied ${val}% discount!` : 'Discount removed');
        }}
      />

      <CustomItemModal
        isOpen={isCustomItemOpen}
        onClose={() => setIsCustomItemOpen(false)}
        onAddCustomItem={handleAddCustomItem}
      />

      <BarcodeModal
        isOpen={isBarcodeOpen}
        onClose={() => setIsBarcodeOpen(false)}
        menuItems={menuItems}
        onBarcodeFound={handleBarcodeFound}
      />

      {toastMessage && (
        <div className="pos-toast">
          <span>&#10024; {toastMessage}</span>
        </div>
      )}
    </div>
  );
}
