import React from 'react';
import StatusBadge from '../../StatusBadge';
import { calculatePriorityScore } from '../../../utils/priority';

const RequestCard = ({ request, onDeliver, onReduceStock }) => {
  const score = calculatePriorityScore(request);
  const isCritical = request.currentStock < 20;

  return (
    <div className="glass-card" style={{ padding: '20px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '1.25rem' }}>{request.location}</h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Cargo: <span style={{ color: 'white' }}>{request.items}</span> •
            Stock: <span style={{ color: isCritical ? 'var(--danger)' : 'var(--success)', fontWeight: 'bold' }}>
              {request.currentStock}%
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>PRIORITY</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent)' }}>{score}</div>
        </div>
      </div>

      <div style={{
        marginTop: '20px',
        paddingTop: '15px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <StatusBadge priority={request.priority} />

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={onReduceStock} style={{
            background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer'
          }}>
            Simulate Crisis
          </button>
          <button className="btn-primary" onClick={onDeliver} style={{ padding: '8px 15px' }}>
            Dispatch
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestCard;