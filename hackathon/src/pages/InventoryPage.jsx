import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGlobalContext } from '../context/GlobalStore';
import { useNotify } from '../context/NotificationContext';
import { useLang } from '../context/LanguageContext';

const CATEGORIES = ['All', 'Medicine', 'Food', 'Water', 'Equipment', 'Fuel'];
const ABSOLUTE_MAX_QTY = 10000000;

const Icons = {
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
};

const getStatus = (qty, maxQty, t) => {
  const pct = maxQty > 0 ? (qty / maxQty) * 100 : 0;
  if (qty === 0) return { label: t('status_out_of_stock') || 'Out of Stock', color: 'var(--danger)', barColor: 'var(--danger)' };
  if (pct < 20) return { label: t('status_low_stock') || 'Low Stock', color: '#f59e0b', barColor: '#f59e0b' };
  return { label: t('status_in_stock') || 'In Stock', color: 'var(--success)', barColor: 'var(--success)' };
};

const InventoryPage = () => {
  const { user } = useAuth();
  const { inventory, updateInventoryQty, addInventoryItem } = useGlobalContext();
  const { showNotification } = useNotify();
  const { t } = useLang();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('EDIT');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({ sku: '', name: '', category: 'Medicine', warehouse: 'Kyiv Central', qty: '', maxQty: '' });

  const canManageInventory = user?.role === 'ADMIN' || user?.role === 'DISPATCHER';
  const gridColumns = canManageInventory ? '2fr 1.2fr 1fr 1.6fr 80px' : '2fr 1.2fr 1fr 1.6fr';

  const filteredData = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || item.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleEditClick = (item) => {
    setModalMode('EDIT');
    setFormData({ ...item, qty: item.qty.toString(), maxQty: item.maxQty.toString() });
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setModalMode('ADD');
    setFormData({ sku: `NEW-${Math.floor(Math.random() * 1000)}`, name: '', category: 'Medicine', warehouse: 'Kyiv Central', qty: '0', maxQty: '1000' });
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    const currentQty = Number(formData.qty);
    const maxCapacity = Number(formData.maxQty);

    if (modalMode === 'ADD') {
      if (!formData.name.trim()) {
        errors.name = 'Name is required';
      } else if (formData.name.trim().length > 50) {
        errors.name = 'Name is too long';
      }
      if (!formData.warehouse.trim()) {
        errors.warehouse = 'Warehouse is required';
      }
      if (isNaN(maxCapacity) || maxCapacity <= 0) {
        errors.maxQty = 'Must be > 0';
      } else if (maxCapacity > ABSOLUTE_MAX_QTY) {
        errors.maxQty = `Max is ${ABSOLUTE_MAX_QTY.toLocaleString()}`;
      }
    }

    if (formData.qty === '' || isNaN(currentQty)) {
      errors.qty = 'Enter a number';
    } else if (currentQty < 0) {
      errors.qty = 'Cannot be negative';
    } else if (currentQty > ABSOLUTE_MAX_QTY) {
      errors.qty = `Max is ${ABSOLUTE_MAX_QTY.toLocaleString()}`;
    } else {
      if (modalMode === 'ADD' && currentQty > maxCapacity && !errors.maxQty) {
        errors.qty = 'Exceeds max capacity';
      } else if (modalMode === 'EDIT') {
        const originalItem = inventory.find(i => i.sku === formData.sku);
        if (originalItem && currentQty > originalItem.maxQty) {
          errors.qty = `Cannot exceed ${originalItem.maxQty}`;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    if (modalMode === 'EDIT') {
      updateInventoryQty(formData.sku, currentQty);
      showNotification(`Stock for ${formData.sku} updated successfully.`, 'success');
    } else {
      const newItem = {
        ...formData,
        qty: currentQty,
        maxQty: maxCapacity,
        status: currentQty === 0 ? 'OUT_OF_STOCK' : (currentQty < maxCapacity * 0.2 ? 'LOW_STOCK' : 'IN_STOCK')
      };
      addInventoryItem(newItem);
      showNotification(`New shipment ${newItem.sku} added to inventory.`, 'success');
    }
    setIsModalOpen(false);
  };

  return (
    <div className="app-main animate-in">

      {/* HEADER */}
      <div className="inventory-header">
        <div className="inventory-header-text">
          <h1 className="inventory-title">
            {t('inventory_title') || 'Inventory Management'}
          </h1>
          <p className="inventory-subtitle">
            {canManageInventory ? (t('inventory_subtitle_manage') || 'Monitor and update supply stock levels') : (t('inventory_subtitle_view') || 'Current stock availability status')}
          </p>
        </div>
        {canManageInventory && (
          <button onClick={handleAddClick} className="inventory-add-btn">
            {Icons.plus} {t('add_shipment') || 'Add Shipment'}
          </button>
        )}
      </div>

      {/* FILTERS */}
      <div className="inventory-filters">
        <input
          type="text"
          placeholder={t('search_placeholder') || 'Search by name or SKU...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="settings-input inventory-search"
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="settings-select inventory-select"
        >
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c === 'All' ? (t('all_categories') || 'All Categories') : (t(c) || c)}</option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div style={{
        backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border)',
        borderRadius: '12px', overflow: 'hidden'
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: gridColumns,
          padding: '12px 24px', borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--bg-dark)'
        }}>
          {[t('col_sku') || 'Product / SKU', t('col_location') || 'Warehouse', t('col_status') || 'Status', t('col_stock') || 'Stock Level'].map((h, i) => (
            <span key={i} style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</span>
          ))}
          {canManageInventory && <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('col_action') || 'Action'}</span>}
        </div>

        {filteredData.map((item, idx) => {
          const status = getStatus(item.qty, item.maxQty, t);
          const pct = item.maxQty > 0 ? Math.min((item.qty / item.maxQty) * 100, 100) : 0;

          return (
            <div key={item.sku} style={{
              display: 'grid', gridTemplateColumns: gridColumns,
              padding: '16px 24px', alignItems: 'center',
              borderBottom: idx < filteredData.length - 1 ? '1px solid var(--border)' : 'none',
              transition: 'background-color 0.15s'
            }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '2px' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {item.sku} • {t(item.category) || item.category}
                </div>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {item.warehouse}
              </div>
              <div>
                <span style={{
                  padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800',
                  backgroundColor: `${status.barColor}18`, color: status.color, letterSpacing: '0.3px'
                }}>
                  {status.label}
                </span>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {item.qty.toLocaleString()} / {item.maxQty.toLocaleString()}
                </div>
                <div style={{ height: '6px', backgroundColor: 'var(--bg-card)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, backgroundColor: status.barColor, borderRadius: '3px', transition: 'width 0.3s' }} />
                </div>
              </div>
              {canManageInventory && (
                <div>
                  <button onClick={() => handleEditClick(item)} style={{
                    background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)',
                    borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem',
                    fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    {Icons.edit} {t('edit') || 'Edit'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {filteredData.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            {t('no_orders') || 'No items found matching your criteria.'}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="animate-in" style={{ backgroundColor: 'var(--bg-panel)', padding: '32px', borderRadius: '16px', width: '420px', border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'var(--text-primary)', fontWeight: '700' }}>
              {modalMode === 'EDIT' ? (t('modal_update_stock') || 'Update Stock Level') : (t('modal_add_shipment') || 'Register New Shipment')}
            </h2>
            <form onSubmit={handleModalSubmit} className="settings-section" noValidate>
              {modalMode === 'ADD' && (
                <>
                  <div className="settings-form-group">
                    <label className="settings-label">{t('modal_product_name') || 'Product Name'}</label>
                    <input type="text" className={`settings-input ${fieldErrors.name ? 'input-error' : ''}`} value={formData.name} onChange={e => { setFormData({ ...formData, name: e.target.value }); setFieldErrors({ ...fieldErrors, name: null }); }} />
                    {fieldErrors.name && <span className="field-error-text">{fieldErrors.name}</span>}
                  </div>
                  <div className="settings-form-group">
                    <label className="settings-label">{t('modal_warehouse') || 'Warehouse Location'}</label>
                    <input type="text" className={`settings-input ${fieldErrors.warehouse ? 'input-error' : ''}`} value={formData.warehouse} onChange={e => { setFormData({ ...formData, warehouse: e.target.value }); setFieldErrors({ ...fieldErrors, warehouse: null }); }} />
                    {fieldErrors.warehouse && <span className="field-error-text">{fieldErrors.warehouse}</span>}
                  </div>
                  <div className="settings-form-group">
                    <label className="settings-label">{t('modal_category') || 'Category'}</label>
                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="settings-select">
                      {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{t(c) || c}</option>)}
                    </select>
                  </div>
                  <div className="settings-form-group">
                    <label className="settings-label">{t('modal_max_capacity') || 'Maximum Capacity'}</label>
                    <input type="number" className={`settings-input ${fieldErrors.maxQty ? 'input-error' : ''}`} value={formData.maxQty} onChange={e => { setFormData({ ...formData, maxQty: e.target.value }); setFieldErrors({ ...fieldErrors, maxQty: null }); }} />
                    {fieldErrors.maxQty && <span className="field-error-text">{fieldErrors.maxQty}</span>}
                  </div>
                </>
              )}
              {modalMode === 'EDIT' && (
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', padding: '12px', backgroundColor: 'var(--bg-dark)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  {t('modal_updating_sku') || 'Updating SKU'}: <strong style={{ color: 'var(--text-primary)' }}>{formData.sku}</strong><br />
                  <span style={{ fontSize: '0.85rem' }}>{formData.name}</span>
                </div>
              )}
              <div className="settings-form-group">
                <label className="settings-label">{t('modal_current_qty') || 'Current Quantity'}</label>
                <input type="number" className={`settings-input ${fieldErrors.qty ? 'input-error' : ''}`} value={formData.qty} onChange={e => { setFormData({ ...formData, qty: e.target.value }); setFieldErrors({ ...fieldErrors, qty: null }); }} />
                {fieldErrors.qty && <span className="field-error-text">{fieldErrors.qty}</span>}
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                  {t('cancel') || 'Cancel'}
                </button>
                <button type="submit" className="settings-btn-save" style={{ flex: 1 }}>
                  {t('save_btn') || 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;