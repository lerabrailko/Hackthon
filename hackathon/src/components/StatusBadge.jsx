import React from 'react';
import { STATUS_COLORS } from '../constants/statuses';

const StatusBadge = ({ priority }) => {
  const style = {
    backgroundColor: STATUS_COLORS[priority] || 'var(--bg-card)',
    color: 'white',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.7rem',
    fontWeight: '700',
    textTransform: 'uppercase'
  };

  return <span style={style}>{priority}</span>;
};

export default StatusBadge;