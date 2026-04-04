import React, { useState } from 'react';
import { PRIORITY_LEVELS } from '../../../constants/statuses';

const AddRequestForm = ({ onAdd }) => {
  const [address, setAddress] = useState('');
  const [items, setItems] = useState('Medicine');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!address) return;

    onAdd({
      id: `REQ-${Math.floor(Math.random() * 1000)}`,
      location: address,
      items,
      priority: PRIORITY_LEVELS.NORMAL,
      currentStock: 100,
      status: 'PENDING',
      timestamp: new Date().toISOString()
    });
    setAddress('');
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h3>New Delivery Request</h3>
      <div className="form-group">
        <label>Address</label>
        <input 
          className="input" 
          value={address} 
          onChange={e => setAddress(e.target.value)} 
          placeholder="Enter destination"
        />
      </div>
      <button type="submit" className="btn-primary w-100">Add to Queue</button>
    </form>
  );
};

export default AddRequestForm;