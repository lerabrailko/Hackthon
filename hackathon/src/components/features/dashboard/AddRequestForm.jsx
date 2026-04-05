import React, { useState } from 'react';
import { CustomSelect } from '../../ui/CustomSelect';
import { CustomNumberInput } from '../../ui/CustomNumberInput';
import { PRIORITY_LEVELS } from '../../../constants/statuses';
import { useNotify } from '../../../context/NotificationContext';
import { validateRequired, validatePositiveNumber } from '../../../utils/validators';

const CARGO_TYPES = ['Medicine', 'Food Rations', 'Clean Water', 'Generators', 'Ammunition', 'Other'];

const AddRequestForm = ({ onAdd }) => {
  const { showNotification } = useNotify();
  const [address, setAddress] = useState('');
  const [cargo, setCargo] = useState(CARGO_TYPES[0]);
  const [quantity, setQuantity] = useState('');
  const [priority, setPriority] = useState(PRIORITY_LEVELS.HIGH);
  const [errors, setErrors] = useState({});

  const fakeGeocode = (text) => {
    const baseCoords = [49.0, 31.0];
    return [baseCoords[0] + (text.length * 0.05) - 1, baseCoords[1] - (text.length * 0.05) + 1];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!validateRequired(address)) newErrors.address = 'Address is required';
    
    if (!validateRequired(quantity)) {
      newErrors.quantity = 'Required';
    } else if (!validatePositiveNumber(quantity)) {
      newErrors.quantity = 'Must be > 0';
    } else if (Number(quantity) > 50000) {
      newErrors.quantity = 'Max 50k';
      showNotification('Request exceeds system limit (max 50,000 units).', 'warning');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    
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
    showNotification('Request submitted successfully!', 'success');
  };

  return (
    <form onSubmit={handleSubmit} className="add-request-form" noValidate>
      <div className="form-group">
        <label className="settings-label">DELIVERY ADDRESS</label>
        <input 
          type="text" 
          placeholder="e.g. Kyiv, Khreshchatyk str. 1" 
          value={address} 
          onChange={(e) => { setAddress(e.target.value); setErrors({...errors, address: null}); }} 
          className={`settings-input ${errors.address ? 'input-error' : ''}`}
        />
        {errors.address && <span className="field-error-text">{errors.address}</span>}
      </div>
      
      <div className="form-row-flex">
        <div className="form-group flex-1">
          <label className="settings-label">CARGO TYPE</label>
          <CustomSelect className="settings-select" style={{height: "45px"}} value={cargo} onChange={(e) => setCargo(e.target.value)} options={CARGO_TYPES.map(c => ({value: c, label: c}))} />
        </div>
        <div className="form-group width-120">
          <label className="settings-label">UNITS REQ.</label>
          <input 
            type="number" 
            min="1" 
            placeholder="e.g. 500" 
            value={quantity} 
            onChange={(e) => { setQuantity(e.target.value); setErrors({...errors, quantity: null}); }} 
            className={`settings-input ${errors.quantity ? 'input-error' : ''}`}
          />
          {errors.quantity && <span className="field-error-text">{errors.quantity}</span>}
        </div>
      </div>

      <div className="form-group mb-large">
        <label className="settings-label">URGENCY</label>
        <CustomSelect className="settings-select" style={{height: "45px"}} value={priority} onChange={(e) => setPriority(e.target.value)} options={[{value: PRIORITY_LEVELS.NORMAL, label: "Normal"}, {value: PRIORITY_LEVELS.HIGH, label: "High Priority"}, {value: PRIORITY_LEVELS.CRITICAL, label: "Critical Alert"}]} />
      </div>

      <button type="submit" className="settings-btn-save w-100">
        SUBMIT REQUEST
      </button>
    </form>
  );
};

export default AddRequestForm;