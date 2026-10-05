import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  ToggleLeft,
  ToggleRight,
  Grid,
  List
} from 'lucide-react';
import { CATEGORIES } from '../data/menuData';

export default function MenuManagement({
  menuItems,
  setMenuItems
}) {
  const [selectedCat, setSelectedCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Edit Popup Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategory, setEditCategory] = useState('mains');
  const [editImage, setEditImage] = useState('');
  const [editHasStar, setEditHasStar] = useState(false);
  const [editIsAvailable, setEditIsAvailable] = useState(true);

  // Add Item Popup Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('mains');
  const [newImage, setNewImage] = useState('');
  const [newHasStar, setNewHasStar] = useState(false);
  const [newIsAvailable, setNewIsAvailable] = useState(true);

  // Filtered items
  const filteredItems = menuItems.filter((i) => {
    const matchCat = selectedCat === 'all' || i.category === selectedCat;
    const matchSearch =
      !searchQuery.trim() ||
      i.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Direct Stock Toggle Badge On/Off
  const handleToggleAvailability = (id) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, isAvailable: item.isAvailable === false ? true : false }
          : item
      )
    );
  };

  // Delete Dish
  const handleDeleteDish = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from the menu?`)) {
      setMenuItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Open Edit Popup Modal
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditPrice(item.price.toString());
    setEditCategory(item.category || 'mains');
    setEditImage(item.image || '/food/biryani.jpg');
    setEditHasStar(Boolean(item.hasStar));
    setEditIsAvailable(item.isAvailable !== false);
  };

  // Save Edit Dish Popup
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editName.trim() || !editPrice || isNaN(parseFloat(editPrice))) return;

    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              name: editName.trim(),
              price: parseFloat(editPrice),
              category: editCategory,
              image: editImage.trim() || '/food/biryani.jpg',
              hasStar: editHasStar,
              isAvailable: editIsAvailable
            }
          : item
      )
    );
    setEditingItem(null);
  };

  // Save Add New Dish Popup
  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice || isNaN(parseFloat(newPrice))) return;

    const newDishObj = {
      id: 'dish-' + Date.now(),
      name: newName.trim(),
      price: parseFloat(newPrice),
      category: newCategory,
      image: newImage.trim() || '/food/biryani.jpg',
      isAvailable: newIsAvailable,
      hasStar: newHasStar
    };

    setMenuItems((prev) => [newDishObj, ...prev]);
    setIsAddModalOpen(false);
    setNewName('');
    setNewPrice('');
    setNewImage('');
    setNewHasStar(false);
    setNewIsAvailable(true);
  };

  return (
    <div className="menu-manage-container">
      {/* 1. Top Banner */}
      <div className="menu-manage-header">
        <div className="menu-manage-title-wrap">
          <div className="menu-icon-circle">
            <UtensilsCrossed size={24} color="#5025d1" />
          </div>
          <div>
            <h2 className="menu-manage-heading">Menu Items Management</h2>
            <p className="menu-manage-sub">
              Add new dishes via popup modal, edit item details & toggle stock availability
            </p>
          </div>
        </div>

        <div className="menu-header-actions">
          <div className="view-mode-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid Cards View"
            >
              <Grid size={18} />
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Table List View"
            >
              <List size={18} />
            </button>
          </div>

          <button
            className="add-dish-top-btn"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={18} />
            <span>Add New Dish</span>
          </button>
        </div>
      </div>

      {/* 2. Filter and Search Bar */}
      <div className="menu-manage-toolbar">
        <div className="menu-manage-search">
          <Search size={17} />
          <input
            type="text"
            placeholder="Search items in menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="menu-cat-chips">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              className={`cat-chip ${selectedCat === c.id ? 'active' : ''}`}
              onClick={() => setSelectedCat(c.id)}
            >
              <span>{c.icon}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. GRID VIEW (MATCHING REFERENCE SCREENSHOT WITH STOCK BADGE ON TOP RIGHT) */}
      {viewMode === 'grid' ? (
        <div className="menu-grid-cards-wrap">
          {filteredItems.map((item) => {
            const isAvailable = item.isAvailable !== false;
            return (
              <div
                key={item.id}
                className={`menu-dish-card ${!isAvailable ? 'out-of-stock' : ''}`}
              >
                {/* Image Box */}
                <div className="dish-card-img-box">
                  <img
                    src={item.image || '/food/biryani.jpg'}
                    alt={item.name}
                    className="dish-card-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/food/biryani.jpg';
                    }}
                  />

                  {/* Top Right Stock Badge Toggle Pill */}
                  <button
                    className={`stock-top-badge ${isAvailable ? 'in-stock' : 'out-of-stock'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleAvailability(item.id);
                    }}
                    title="Click to toggle Stock Availability (On / Off)"
                  >
                    <span className="badge-dot"></span>
                    <span>{isAvailable ? 'In Stock' : 'Out of Stock'}</span>
                  </button>

                  {!isAvailable && (
                    <span className="out-of-stock-overlay">Out of Stock</span>
                  )}
                  {item.hasStar && (
                    <span className="bestseller-star-badge">⭐ Bestseller</span>
                  )}
                </div>

                {/* Content */}
                <div className="dish-card-body">
                  <h3 className="dish-card-title">{item.name}</h3>

                  <div className="dish-card-footer">
                    <span className="dish-card-price">
                      ₹{item.price.toFixed(2)}
                    </span>

                    <div className="dish-card-actions">
                      <button
                        className="dish-act-icon-btn edit"
                        onClick={() => handleOpenEdit(item)}
                        title="Edit Dish (Popup)"
                      >
                        <Edit2 size={15} />
                      </button>

                      <button
                        className="dish-act-icon-btn delete"
                        onClick={() => handleDeleteDish(item.id, item.name)}
                        title="Delete Dish"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 4. TABLE LIST VIEW */
        <div className="menu-items-table-card">
          <table className="menu-management-table">
            <thead>
              <tr>
                <th>Dish</th>
                <th>Category</th>
                <th>Price (₹)</th>
                <th>Stock Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const isAvailable = item.isAvailable !== false;

                return (
                  <tr key={item.id} className={!isAvailable ? 'row-disabled' : ''}>
                    <td className="dish-name-cell">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="dish-table-thumb"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/food/biryani.jpg';
                        }}
                      />
                      <div>
                        <strong className="dish-title-text">{item.name}</strong>
                        {item.hasStar && (
                          <span className="bestseller-tag">⭐ Bestseller</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span className="category-badge-pill">{item.category}</span>
                    </td>

                    <td>
                      <span className="price-display-tag">
                        ₹{item.price.toFixed(2)}
                      </span>
                    </td>

                    <td>
                      <button
                        className={`avail-toggle-btn ${
                          isAvailable ? 'in-stock' : 'out-of-stock'
                        }`}
                        onClick={() => handleToggleAvailability(item.id)}
                      >
                        {isAvailable ? (
                          <>
                            <ToggleRight size={20} color="#10b981" />
                            <span>In Stock</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={20} color="#ef4444" />
                            <span>Out of Stock</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions-group">
                        <button
                          className="table-act-btn edit"
                          onClick={() => handleOpenEdit(item)}
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        <button
                          className="table-act-btn delete"
                          onClick={() => handleDeleteDish(item.id, item.name)}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ====================================================================
         5. EDIT DISH POPUP MODAL
         ==================================================================== */}
      {editingItem && (
        <div className="pos-modal-overlay">
          <div className="pos-modal-card menu-form-popup-modal">
            <div className="popup-modal-header">
              <div className="popup-modal-title-row">
                <div className="popup-icon-badge edit">
                  <Edit2 size={20} color="#5025d1" />
                </div>
                <div>
                  <h3 className="popup-heading">Edit Menu Item</h3>
                  <p className="popup-subheading">Update dish details, pricing and availability</p>
                </div>
              </div>
              <button
                className="modal-close-icon-btn"
                onClick={() => setEditingItem(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="popup-modal-form">
              <div className="popup-form-group">
                <label>Dish Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter dish title..."
                  required
                  autoFocus
                />
              </div>

              <div className="popup-form-row-2col">
                <div className="popup-form-group">
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="popup-form-group">
                  <label>Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                  >
                    {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="popup-form-group">
                <label>Image URL</label>
                <input
                  type="text"
                  placeholder="/food/burger.jpg"
                  value={editImage}
                  onChange={(e) => setEditImage(e.target.value)}
                />
              </div>

              <div className="popup-switches-row">
                <label className="popup-switch-item">
                  <input
                    type="checkbox"
                    checked={editHasStar}
                    onChange={(e) => setEditHasStar(e.target.checked)}
                  />
                  <span className="switch-label-text">⭐ Mark as Bestseller</span>
                </label>

                <label className="popup-switch-item">
                  <input
                    type="checkbox"
                    checked={editIsAvailable}
                    onChange={(e) => setEditIsAvailable(e.target.checked)}
                  />
                  <span className="switch-label-text">🟢 Stock Available</span>
                </label>
              </div>

              <div className="popup-modal-footer">
                <button
                  type="button"
                  className="popup-btn-cancel"
                  onClick={() => setEditingItem(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="popup-btn-save">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
         6. ADD NEW DISH POPUP MODAL
         ==================================================================== */}
      {isAddModalOpen && (
        <div className="pos-modal-overlay">
          <div className="pos-modal-card menu-form-popup-modal">
            <div className="popup-modal-header">
              <div className="popup-modal-title-row">
                <div className="popup-icon-badge add">
                  <Plus size={20} color="#5025d1" />
                </div>
                <div>
                  <h3 className="popup-heading">Add New Menu Item</h3>
                  <p className="popup-subheading">Create a new dish for your restaurant menu</p>
                </div>
              </div>
              <button
                className="modal-close-icon-btn"
                onClick={() => setIsAddModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="popup-modal-form">
              <div className="popup-form-group">
                <label>Dish Name</label>
                <input
                  type="text"
                  placeholder="e.g. French Fries / Veg Burger"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="popup-form-row-2col">
                <div className="popup-form-group">
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="120.00"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="popup-form-group">
                  <label>Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  >
                    {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="popup-form-group">
                <label>Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="/food/burger.jpg"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                />
              </div>

              <div className="popup-switches-row">
                <label className="popup-switch-item">
                  <input
                    type="checkbox"
                    checked={newHasStar}
                    onChange={(e) => setNewHasStar(e.target.checked)}
                  />
                  <span className="switch-label-text">⭐ Mark as Bestseller</span>
                </label>

                <label className="popup-switch-item">
                  <input
                    type="checkbox"
                    checked={newIsAvailable}
                    onChange={(e) => setNewIsAvailable(e.target.checked)}
                  />
                  <span className="switch-label-text">🟢 Stock Available</span>
                </label>
              </div>

              <div className="popup-modal-footer">
                <button
                  type="button"
                  className="popup-btn-cancel"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="popup-btn-save">
                  Add Item to Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
