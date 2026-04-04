import React from 'react';

const Button = ({ children, onClick, variant = 'primary', type = 'button', disabled = false }) => {
  const className = `btn-${variant} ${disabled ? 'btn-disabled' : ''}`;
  
  return (
    <button type={type} className={className} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;