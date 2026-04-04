import React from 'react';
import { STATUS_COLORS } from '../constants/statuses';

const StatusBadge = ({ priority }) => {
  const badgeStyle = {
    backgroundColor: STATUS_COLORS[priority] || '#ccc',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  };

  return <span style={badgeStyle}>{priority}</span>;
};

export default StatusBadge;