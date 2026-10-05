import React from 'react';
import {
  LayoutGrid,
  Utensils,
  Soup,
  GlassWater,
  CakeSlice,
  Search,
  Barcode,
  Plus,
  Sparkles
} from 'lucide-react';
import { MENU_CATEGORIES } from '../data/menuData';

export default function MenuSection({
  menuItems,
  selectedCategory,
  setSelectedCategory,
  searchFilter,
  setSearchFilter,
  onAddToCart,
  onOpenBarcode,
  onOpenCustomItem
}) {
  const getCategoryIcon = (id) => {
    switch (id) {
      case 'all':
        return <LayoutGrid size={18} />;
      case 'starters':
        return <Utensils size={18} />;
      case 'main':
        return <Soup size={18} />;
      case 'beverages':
        return <GlassWater size={18} />;
      case 'desserts':
        return <CakeSlice size={18} />;
      default:
        return <LayoutGrid size={18} />;
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (item.code && item.code.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="pos-menu-section">
      {/* Category Pills Header */}
      <div className="menu-header-bar">
        <h2 className="menu-section-title">Menu Items</h2>

        <div className="categories-pill-row">
          {MENU_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                className={`category-pill-btn ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span className="cat-icon">{getCategoryIcon(cat.id)}</span>
                <span className="cat-label">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4-Column Food Cards Grid */}
      <div className="menu-items-grid">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="food-card"
            onClick={() => onAddToCart(item)}
          >
            <div className="food-card-img-wrapper">
              <img
                src={item.image}
                alt={item.name}
                className="food-card-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/mr-mango-logo.png';
                }}
              />
            </div>

            <div className="food-card-info">
              <div className="food-title-row">
                {item.hasStar && (
                  <Sparkles size={14} className="food-star-icon" fill="#ffb703" color="#ffb703" />
                )}
                <span className="food-name" title={item.name}>{item.name}</span>
              </div>

              <div className="food-price-row">
                <span className="food-price">₹{item.price.toFixed(2)}</span>
                <button
                  className="add-to-cart-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(item);
                  }}
                  title={`Add ${item.name}`}
                >
                  <Plus size={16} strokeWidth={2.8} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Search & Action Bar */}
      <div className="menu-bottom-toolbar">
        <div className="menu-sub-search">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search item by name or code..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="sub-search-input"
          />
        </div>

        <button
          className="bottom-action-btn barcode-btn"
          onClick={onOpenBarcode}
        >
          <Barcode size={18} />
          <span>Scan Barcode</span>
        </button>

        <button
          className="bottom-action-btn custom-item-btn"
          onClick={onOpenCustomItem}
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Custom Item</span>
        </button>
      </div>
    </section>
  );
}
