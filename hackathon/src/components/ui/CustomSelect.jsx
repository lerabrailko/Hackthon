import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export const CustomSelect = ({ value, onChange, options, className = '', style = {} }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    if (onChange) {
      onChange({ target: { value: val } });
    }
    setOpen(false);
  };

  const selectedOption = options.find(o => (o.value !== undefined ? o.value : o) === value) || options[0];
  const label = selectedOption?.label !== undefined ? selectedOption.label : (selectedOption?.value !== undefined ? selectedOption.value : selectedOption);

  return (
    <div ref={ref} className={`custom-select-container ${open ? 'open' : ''} ${className}`} style={style}>
      <button 
        type="button"
        onClick={() => setOpen(!open)}
        className="custom-select-trigger"
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label}
        </span>
        <ChevronDown size={16} color="var(--text-secondary)" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
      </button>
      
      {open && (
        <div className="custom-select-dropdown">
          {options.map((opt, i) => {
            const val = opt.value !== undefined ? opt.value : opt;
            const text = opt.label !== undefined ? opt.label : (opt.value !== undefined ? opt.value : opt);
            const isSelected = val === value;
            
            return (
              <div 
                key={i}
                onClick={() => handleSelect(val)}
                className={`custom-select-option ${isSelected ? 'selected' : ''}`}
              >
                {text}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
