import React from 'react';

const Button = ({ children, onClick, variant = 'primary', style }) => {
  const baseStyle = {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: '0.3s',
    ...style
  };

  const variants = {
    primary: { backgroundColor: '#38bdf8', color: '#0f172a' },
    secondary: { backgroundColor: '#334155', color: '#94a3b8' },
    danger: { backgroundColor: '#ef4444', color: 'white' }
  };

  return (
    <button
      onClick={onClick}
      style={{ ...baseStyle, ...variants[variant] }}
    >
      {children}
    </button>
  );
};

export default Button;