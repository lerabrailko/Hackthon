import React from 'react';


const WEEKLY_DATA = [
  { day: 'Mon', trips: 42, delayed: 2 },
  { day: 'Tue', trips: 56, delayed: 5 },
  { day: 'Wed', trips: 38, delayed: 1 },
  { day: 'Thu', trips: 65, delayed: 8 },
  { day: 'Fri', trips: 48, delayed: 3 },
  { day: 'Sat', trips: 24, delayed: 0 },
  { day: 'Sun', trips: 18, delayed: 0 },
];

const INCIDENTS = [
  { id: 'INC-01', route: 'Lviv - Kyiv', reason: 'Border Delay', time: '2 hours ago', status: 'Resolved' },
  { id: 'INC-02', route: 'Odesa Port - Dnipro', reason: 'Customs Check', time: '5 hours ago', status: 'Active' },
  { id: 'INC-03', route: 'Kyiv Hub - Kharkiv', reason: 'Vehicle Breakdown', time: '1 day ago', status: 'Resolved' },
];

const AnalyticsPage = () => {
  return (
    <div className="animate-in" style={{ padding: '40px', height: '100vh', overflowY: 'auto', backgroundColor: '#09090b', color: '#f4f4f5' }}>
      
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Performance Analytics</h1>
        <p style={{ color: '#a1a1aa', margin: 0 }}>Overview of fleet efficiency and supply chain health.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        
        <div style={{ backgroundColor: '#18181b', padding: '24px', borderRadius: '16px', border: '1px solid #27272a' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>On-Time Delivery</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: '800', color: '#22c55e' }}>94.2%</span>
            <span style={{ fontSize: '0.85rem', color: '#22c55e', fontWeight: '700' }}>↑ +2.1%</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#71717a', marginTop: '8px' }}>Compared to last month</div>
        </div>

        <div style={{ backgroundColor: '#18181b', padding: '24px', borderRadius: '16px', border: '1px solid #27272a' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Active Incidents</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ef4444' }}>3</span>
            <span style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: '700' }}>↓ -1</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#71717a', marginTop: '8px' }}>Requiring dispatcher attention</div>
        </div>

        <div style={{ backgroundColor: '#18181b', padding: '24px', borderRadius: '16px', border: '1px solid #27272a' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Total Volume Moved</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: '800', color: '#f4f4f5' }}>142k</span>
            <span style={{ fontSize: '0.85rem', color: '#a1a1aa', fontWeight: '700' }}>units</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#71717a', marginTop: '8px' }}>Across all hubs this week</div>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        
        <div style={{ backgroundColor: '#18181b', padding: '32px', borderRadius: '16px', border: '1px solid #27272a' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', margin: '0 0 24px 0' }}>Weekly Fleet Dispatch Volume</h2>
          
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', gap: '16px', paddingBottom: '10px', borderBottom: '1px solid #3f3f46' }}>
            {WEEKLY_DATA.map((data, index) => {
              const maxTrips = 80; 
              const heightPercent = (data.trips / maxTrips) * 100;
              const delayPercent = (data.delayed / maxTrips) * 100;
              
              return (
                <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '8px' }}>
                  <div style={{ width: '100%', maxWidth: '40px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative' }}>
                    
                    <div className="bar-tooltip" style={{ position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#27272a', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700', opacity: 0, transition: '0.2s', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
                      {data.trips} trips
                    </div>

                    <div style={{ width: '100%', height: `${delayPercent}%`, backgroundColor: '#ef4444', borderTopLeftRadius: heightPercent === delayPercent ? '4px' : '0', borderTopRightRadius: heightPercent === delayPercent ? '4px' : '0' }}></div>
                    <div style={{ width: '100%', height: `${heightPercent - delayPercent}%`, backgroundColor: '#3b82f6', borderTopLeftRadius: '4px', borderTopRightRadius: '4px', transition: '0.3s' }}
                         onMouseEnter={(e) => { e.target.style.opacity = 0.8; e.target.previousSibling.previousSibling.style.opacity = 1; }}
                         onMouseLeave={(e) => { e.target.style.opacity = 1; e.target.previousSibling.previousSibling.style.opacity = 0; }}
                    ></div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#a1a1aa', fontWeight: '600' }}>{data.day}</span>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '24px', marginTop: '20px', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#a1a1aa' }}><div style={{ width: '12px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '3px' }}></div> On Time</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#a1a1aa' }}><div style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '3px' }}></div> Delayed</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#18181b', padding: '32px', borderRadius: '16px', border: '1px solid #27272a', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', margin: '0 0 24px 0' }}>Recent Risk Factors</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
            {INCIDENTS.map((inc, i) => (
              <div key={i} style={{ padding: '16px', backgroundColor: '#09090b', borderRadius: '12px', borderLeft: inc.status === 'Active' ? '4px solid #ef4444' : '4px solid #22c55e' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#f4f4f5' }}>{inc.route}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '4px', backgroundColor: inc.status === 'Active' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', color: inc.status === 'Active' ? '#ef4444' : '#22c55e' }}>
                    {inc.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '4px' }}>Issue: <span style={{ color: '#d4d4d8' }}>{inc.reason}</span></div>
                <div style={{ fontSize: '0.7rem', color: '#71717a' }}>{inc.time}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsPage;