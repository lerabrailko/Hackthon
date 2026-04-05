import React, { useState } from 'react';
import { useLang } from '../context/LanguageContext';

const WEEKLY_DATA = [
  { day: 'Mon', onTime: 40, delayed: 2 },
  { day: 'Tue', onTime: 51, delayed: 5 },
  { day: 'Wed', onTime: 37, delayed: 1 },
  { day: 'Thu', onTime: 57, delayed: 8 },
  { day: 'Fri', onTime: 45, delayed: 3 },
  { day: 'Sat', onTime: 24, delayed: 0 },
  { day: 'Sun', onTime: 18, delayed: 0 },
];

const RISK_FACTORS = [
  { route: 'Lviv - Kyiv', issue: 'Border Delay', time: '2 hours ago', status: 'resolved' },
  { route: 'Odesa Port - Dnipro', issue: 'Customs Check', time: '5 hours ago', status: 'active' },
  { route: 'Kyiv Hub - Kharkiv', issue: 'Vehicle Breakdown', time: '1 day ago', status: 'resolved' },
];

const maxVal = Math.max(...WEEKLY_DATA.map(d => d.onTime + d.delayed));

const AnalyticsPage = () => {
  const { t } = useLang();
  const [hoveredDay, setHoveredDay] = useState(null);

  return (
    <div className="app-main animate-in" style={{ paddingTop: '48px', paddingBottom: '32px' }}>

      {/* HEADER */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
          {t('analytics_title')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
          {t('analytics_subtitle')}
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="analytics-kpi-grid">
        <div style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
            {t('on_time_delivery')}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--success)' }}>94.2%</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: '700' }}>↑ +2.1%</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('compared_last_month')}</div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
            {t('active_incidents')}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--danger)' }}>3</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--danger)', fontWeight: '700' }}>↓ -1</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('requiring_attention')}</div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
            {t('total_volume')}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>142k</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{t('units')}</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('across_hubs')}</div>
        </div>
      </div>

      {/* CHART + RISK FACTORS */}
      <div className="analytics-bottom-grid">

        {/* BAR CHART */}
        <div style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 20px 0' }}>
            {t('weekly_dispatch')}
          </h2>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', gap: '12px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
            {WEEKLY_DATA.map((d) => {
              const total = d.onTime + d.delayed;
              const totalPct = (total / maxVal) * 100;
              const delayedPct = total > 0 ? (d.delayed / total) * 100 : 0;
              const isHovered = hoveredDay === d.day;

              return (
                <div
                  key={d.day}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', height: '100%' }}
                  onMouseEnter={() => setHoveredDay(d.day)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
                    <div style={{
                      position: 'absolute', bottom: `calc(${totalPct}% + 8px)`, left: '50%', transform: 'translateX(-50%)',
                      backgroundColor: 'var(--bg-card)', padding: '4px 8px', borderRadius: '6px',
                      fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-primary)',
                      border: '1px solid var(--border)',
                      opacity: isHovered ? 1 : 0, transition: '0.15s ease', pointerEvents: 'none',
                      whiteSpace: 'nowrap', zIndex: 10,
                    }}>
                      {total}
                    </div>
                    <div style={{
                      width: '100%', height: `${totalPct}%`, minHeight: totalPct > 0 ? '4px' : '0',
                      display: 'flex', flexDirection: 'column', borderRadius: '6px', overflow: 'hidden',
                      opacity: isHovered ? 0.85 : 1, transition: 'opacity 0.2s',
                    }}>
                      {d.delayed > 0 && (
                        <div style={{ height: `${delayedPct}%`, minHeight: '3px', backgroundColor: 'var(--danger)', flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1, backgroundColor: 'var(--accent)' }} />
                    </div>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: isHovered ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: '600', transition: '0.2s', flexShrink: 0 }}>
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '24px', marginTop: '16px', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--accent)', borderRadius: '3px' }} />
              {t('on_time')}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--danger)', borderRadius: '3px', opacity: 0.85 }} />
              {t('delayed')}
            </div>
          </div>
        </div>

        {/* RISK FACTORS */}
        <div style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 20px 0' }}>
            {t('recent_risks')}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            {RISK_FACTORS.map((inc, i) => (
              <div key={i} style={{
                padding: '14px',
                backgroundColor: 'var(--bg-dark)',
                borderRadius: '12px',
                border: `1px solid var(--border)`,
                borderLeft: inc.status === 'active' ? '4px solid var(--danger)' : '4px solid var(--success)',
                transition: 'transform 0.2s ease',
                cursor: 'default'
              }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', gap: '8px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inc.route}</span>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: '800', textTransform: 'uppercase', padding: '3px 7px',
                    borderRadius: '5px', flexShrink: 0,
                    backgroundColor: inc.status === 'active' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                    color: inc.status === 'active' ? 'var(--danger)' : 'var(--success)'
                  }}>
                    {inc.status === 'active' ? t('status_active') : t('status_resolved')}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  {t('issue')}: <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{t(inc.issue)}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', opacity: 0.7 }}>
                  {inc.time}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsPage;