import React, { useState } from 'react';
import { PRIORITY_LEVELS } from '../../../constants/statuses';

const CARGO_TYPES = ['Medicine', 'Food Rations', 'Clean Water', 'Generators', 'Ammunition', 'Other'];

const AddRequestForm = ({ onAdd }) => {
  const [address, setAddress] = useState('');
  const [cargo, setCargo] = useState(CARGO_TYPES[0]);
  const [quantity, setQuantity] = useState('');
  const [priority, setPriority] = useState(PRIORITY_LEVELS.HIGH);

  const fakeGeocode = (text) => {
    const baseCoords = [49.0, 31.0];
    return [baseCoords[0] + (text.length * 0.05) - 1, baseCoords[1] - (text.length * 0.05) + 1];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!address || !quantity) return;

    onAdd({
      id: `REQ-${Math.floor(Math.random() * 10000)}`,
      location: address,
      coords: fakeGeocode(address), 
      items: cargo,
      priority,
      quantity: Number(quantity),
      currentStock: 0, 
      status: 'PENDING',
      timestamp: new Date().toISOString(),
    });

    setAddress('');
    setQuantity('');
  };

  const inputStyle = { padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-dark)', color: 'white', width: '100%', outline: 'none' };

  return (
    <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--bg-panel)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>DELIVERY ADDRESS</label>
        <input type="text" placeholder="e.g. Kyiv, Khreshchatyk str. 1" value={address} onChange={(e) => setAddress(e.target.value)} style={inputStyle} required />
      </div>
      
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>CARGO TYPE</label>
          <select value={cargo} onChange={(e) => setCargo(e.target.value)} style={{...inputStyle, appearance: 'auto'}}>
            {CARGO_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ width: '120px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>UNITS REQ.</label>
          <input type="number" min="1" placeholder="e.g. 500" value={quantity} onChange={(e) => setQuantity(e.target.value)} style={inputStyle} required />
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>URGENCY</label>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{...inputStyle, appearance: 'auto'}}>
          <option value={PRIORITY_LEVELS.NORMAL}>Normal</option>
          <option value={PRIORITY_LEVELS.HIGH}>High Priority</option>
          <option value={PRIORITY_LEVELS.CRITICAL}>Critical Alert</option>
        </select>
      </div>

      <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
        SUBMIT REQUEST
      </button>
    </form>
  );
};

export default AddRequestForm;