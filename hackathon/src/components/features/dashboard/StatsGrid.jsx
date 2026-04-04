import React from 'react';
import { useGlobalContext } from '../../../context/GlobalStore';
import { PRIORITY_LEVELS } from '../../../constants/statuses';

const StatsGrid = () => {
  const { requests } = useGlobalContext();

  const stats = {
    total: requests.length,
    critical: requests.filter(r => r.priority === PRIORITY_LEVELS.CRITICAL).length,
    avgStock: requests.length 
      ? Math.round(requests.reduce((acc, r) => acc + r.currentStock, 0) / requests.length) 
      : 0
  };

  const cardStyle = {
    backgroundColor: 'var(--bg-card)',
    padding: '20px',
    borderRadius: '16px',
    border: '1px solid var(--border)',
    flex: 1
  };

  return (
    <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }} className="animate-in">
      <div style={cardStyle}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Total Active</div>
        <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '5px' }}>{stats.total}</div>
      </div>
      <div style={{ ...cardStyle, borderLeft: '4px solid var(--danger)' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Critical Alert</div>
        <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '5px', color: 'var(--danger)' }}>{stats.critical}</div>
      </div>
      <div style={{ ...cardStyle, borderLeft: '4px solid var(--accent)' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Avg Stock</div>
        <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '5px' }}>{stats.avgStock}%</div>
      </div>
    </div>
  );
};

export default StatsGrid;