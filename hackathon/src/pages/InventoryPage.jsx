import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGlobalContext } from '../context/GlobalStore';
import { useNotify } from '../context/NotificationContext';
import { useLang } from '../context/LanguageContext';

const CATEGORIES = ['All', 'Medicine', 'Food', 'Water', 'Equipment', 'Fuel'];

const Icons = {
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
};

const getStatus = (qty, maxQty, t) => {
  const pct = maxQty > 0 ? (qty / maxQty) * 100 : 0;
  if (qty === 0) return { label: t('status_out_of_stock'), color: 'var(--danger)', barColor: 'var(--danger)' };
  if (pct < 20) return { label: t('status_low_stock'), color: '#f59e0b', barColor: '#f59e0b' };
  return { label: t('status_in_stock'), color: 'var(--success)', barColor: 'var(--success)' };
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
  const [formData, setFormData] = useState({ sku: '', name: '', category: 'Medicine', warehouse: 'Kyiv Central', qty: 0, maxQty: 1000 });

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
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setModalMode('ADD');
    setFormData({ sku: `NEW-${Math.floor(Math.random()*1000)}`, name: '', category: 'Medicine', warehouse: 'Kyiv Central', qty: 0, maxQty: 10000 });
    setIsModalOpen(true);
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (modalMode === 'EDIT') {
      updateInventoryQty(formData.sku, formData.qty);
      showNotification(`Stock for ${formData.sku} updated successfully.`, 'success');
    } else {
      const newItem = {
        ...formData,
        qty: Number(formData.qty), maxQty: Number(formData.maxQty),
        status: Number(formData.qty) === 0 ? 'OUT_OF_STOCK' : (Number(formData.qty) < Number(formData.maxQty)*0.2 ? 'LOW_STOCK' : 'IN_STOCK')
      };
      addInventoryItem(newItem);
      showNotification(`New shipment ${newItem.sku} added to inventory.`, 'success');
    }
    setIsModalOpen(false);
  };

  return (
    <div className="app-main animate-in">
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px' }}>
            {t('inventory_title')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {canManageInventory ? t('inventory_subtitle_manage') : t('inventory_subtitle_view')}
          </p>
        </div>
        {canManageInventory && (
          <button onClick={handleAddClick} style={{
            padding: '10px 20px', backgroundColor: 'var(--accent)', color: '#fff',
            border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer',
            fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            {Icons.plus} {t('add_shipment')}
          </button>
        )}
      </div>

      {/* FILTERS */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <input
          type="text"
          placeholder={t('search_placeholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="settings-input"
          style={{ maxWidth: '380px' }}
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="settings-select"
          style={{ maxWidth: '200px' }}
        >
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c === 'All' ? t('all_categories') : t(c)}</option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div style={{
        backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border)',
        borderRadius: '12px', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: gridColumns,
          padding: '12px 24px', borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--bg-dark)'
        }}>
          {[t('col_sku'), t('col_location'), t('col_status'), t('col_stock')].map((h, i) => (
            <span key={i} style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</span>
          ))}
          {canManageInventory && <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('col_action')}</span>}
        </div>

        {/* Rows */}
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
                    {Icons.edit} {t('edit')}
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {filteredData.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            {t('no_orders')}
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="animate-in" style={{ backgroundColor: 'var(--bg-panel)', padding: '32px', borderRadius: '16px', width: '420px', border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'var(--text-primary)', fontWeight: '700' }}>
              {modalMode === 'EDIT' ? t('modal_update_stock') : t('modal_add_shipment')}
            </h2>
            <form onSubmit={handleModalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {modalMode === 'ADD' && (
                <>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                      {t('modal_product_name')}
                    </label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="settings-input" />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                      {t('modal_warehouse')}
                    </label>
                    <input type="text" required value={formData.warehouse} onChange={e => setFormData({...formData, warehouse: e.target.value})} className="settings-input" />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                      {t('modal_category')}
                    </label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="settings-select">
                      {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{t(c)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                      {t('modal_max_capacity')}
                    </label>
                    <input type="number" required min="1" value={formData.maxQty} onChange={e => setFormData({...formData, maxQty: e.target.value})} className="settings-input" />
                  </div>
                </>
              )}

              {modalMode === 'EDIT' && (
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', padding: '12px', backgroundColor: 'var(--bg-dark)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  {t('modal_updating_sku')}: <strong style={{ color: 'var(--text-primary)' }}>{formData.sku}</strong><br />
                  <span style={{ fontSize: '0.85rem' }}>{formData.name}</span>
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                  {t('modal_current_qty')}
                </label>
                <input type="number" required min="0" value={formData.qty} onChange={e => setFormData({...formData, qty: e.target.value})} className="settings-input" />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '12px', backgroundColor: 'var(--accent)', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}
                >
                  {t('save_btn')}
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