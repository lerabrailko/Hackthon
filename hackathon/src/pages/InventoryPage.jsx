import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGlobalContext } from '../context/GlobalStore';
import { useNotify } from '../context/NotificationContext';

const CATEGORIES = ['All', 'Medicine', 'Food', 'Water', 'Equipment', 'Fuel'];

const Icons = {
  search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  filter: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>,
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
};

const tableStyles = `
  .inventory-row { transition: all 0.2s ease; border-bottom: 1px solid #27272a; }
  .inventory-row:hover { background-color: rgba(59, 130, 246, 0.05); }
  .inventory-input:focus, .inventory-select:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.2); }
`;

const InventoryPage = () => {
  const { user } = useAuth();
  const { inventory, updateInventoryQty, addInventoryItem } = useGlobalContext();
  const { showNotification } = useNotify();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('EDIT'); 
  const [formData, setFormData] = useState({ sku: '', name: '', category: 'Medicine', warehouse: 'Kyiv Central', qty: 0, maxQty: 1000 });

  const canManageInventory = user?.role === 'ADMIN' || user?.role === 'DISPATCHER';

  const filteredData = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockCount = inventory.filter(i => i.status === 'LOW_STOCK' || i.status === 'OUT_OF_STOCK').length;

  const handleEditClick = (item) => {
    setModalMode('EDIT');
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setModalMode('ADD');
    setFormData({ sku: `NEW-${Math.floor(Math.random()*1000)}`, name: '', category: 'Medicine', warehouse: 'Kyiv Central', qty: 0, maxQty: 10000, daysLeft: 30 });
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
    <div className="animate-in" style={{ padding: '40px', height: '100vh', overflowY: 'auto', backgroundColor: '#09090b', color: '#f4f4f5', position: 'relative' }}>
      <style>{tableStyles}</style>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Global Inventory</h1>
          <p style={{ color: '#a1a1aa', margin: 0 }}>{canManageInventory ? 'Manage and monitor real-time stock across all hubs.' : 'View available supplies in our network.'}</p>
        </div>
        {canManageInventory && (
          <button onClick={handleAddClick} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
            {Icons.plus} Add Shipment
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <input type="text" placeholder="Search by SKU or Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="inventory-input" style={{ flex: 1, maxWidth: '400px', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '12px 16px', color: '#f4f4f5' }} />
        <select value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)} className="inventory-select" style={{ backgroundColor: '#18181b', color: '#a1a1aa', border: '1px solid #27272a', borderRadius: '8px', padding: '12px 16px', outline: 'none' }}>
          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>)}
        </select>
      </div>

      <div style={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#09090b', borderBottom: '1px solid #27272a' }}>
              <th style={{ padding: '16px 20px', fontSize: '0.75rem', color: '#71717a' }}>SKU & NAME</th>
              <th style={{ padding: '16px 20px', fontSize: '0.75rem', color: '#71717a' }}>LOCATION</th>
              <th style={{ padding: '16px 20px', fontSize: '0.75rem', color: '#71717a' }}>STATUS</th>
              <th style={{ padding: '16px 20px', fontSize: '0.75rem', color: '#71717a' }}>STOCK LEVEL</th>
              {canManageInventory && <th style={{ padding: '16px 20px', fontSize: '0.75rem', color: '#71717a' }}>ACTION</th>}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => {
              const fillPercent = (item.qty / item.maxQty) * 100;
              let statusColor = item.status === 'OUT_OF_STOCK' ? '#ef4444' : (item.status === 'LOW_STOCK' ? '#f59e0b' : '#22c55e');
              
              return (
                <tr key={index} className="inventory-row">
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#f4f4f5' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#71717a' }}>{item.sku} • {item.category}</div>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '0.85rem', color: '#d4d4d8' }}>{item.warehouse}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', backgroundColor: `${statusColor}22`, color: statusColor }}>
                      {item.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px' }}>{item.qty.toLocaleString()} / {item.maxQty.toLocaleString()}</div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: '#27272a', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${fillPercent}%`, height: '100%', backgroundColor: statusColor }}></div>
                    </div>
                  </td>
                  {canManageInventory && (
                    <td style={{ padding: '16px 20px' }}>
                      <button onClick={() => handleEditClick(item)} style={{ background: 'none', border: '1px solid #3f3f46', color: '#a1a1aa', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {Icons.edit} Edit
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#18181b', padding: '32px', borderRadius: '16px', width: '400px', border: '1px solid #3f3f46', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>{modalMode === 'EDIT' ? 'Update Stock Quantity' : 'Add New Shipment'}</h2>
            <form onSubmit={handleModalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {modalMode === 'ADD' && (
                <>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Product Name</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px', backgroundColor: '#09090b', border: '1px solid #27272a', color: '#fff', borderRadius: '6px', marginTop: '4px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Category</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '10px', backgroundColor: '#09090b', border: '1px solid #27272a', color: '#fff', borderRadius: '6px', marginTop: '4px' }}>
                      {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </>
              )}

              {modalMode === 'EDIT' && (
                <div style={{ fontSize: '0.9rem', color: '#d4d4d8', marginBottom: '10px' }}>
                  Updating SKU: <strong style={{color: '#fff'}}>{formData.sku}</strong><br/>
                  {formData.name}
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Current Quantity (Units)</label>
                <input type="number" required min="0" value={formData.qty} onChange={e => setFormData({...formData, qty: e.target.value})} style={{ width: '100%', padding: '10px', backgroundColor: '#09090b', border: '1px solid #27272a', color: '#fff', borderRadius: '6px', marginTop: '4px' }} />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', border: '1px solid #3f3f46', color: '#a1a1aa', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: '#3b82f6', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;