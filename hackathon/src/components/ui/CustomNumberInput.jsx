import React from 'react';
import { Minus, Plus } from 'lucide-react';

export const CustomNumberInput = ({ value, onChange, className = '', style = {}, min, max, placeholder }) => {
  const inc = () => {
    let next = Number(value || 0) + 1;
    if (max !== undefined && next > max) next = max;
    if (onChange) onChange({ target: { value: next } });
  };
  const dec = () => {
    let next = Number(value || 0) - 1;
    if (min !== undefined && next < min) next = min;
    if (onChange) onChange({ target: { value: next } });
  };

  return (
    <div className="custom-number-wrapper" style={style}>
      <input 
        type="number" 
        value={value} 
        onChange={onChange} 
        className={`custom-number-input ${className}`} 
        min={min} 
        max={max} 
        placeholder={placeholder} 
      />
      <div className="custom-number-controls">
        <button type="button" onClick={dec} className="custom-number-btn" aria-label="Decrease">
           <Minus size={14} />
        </button>
        <button type="button" onClick={inc} className="custom-number-btn" aria-label="Increase">
           <Plus size={14} />
        </button>
      </div>
    </div>
  );
};
