import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../context/AuthContext';


const Icons = {
  tracking: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
  map: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>,
  inventory: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
  analytics: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  logout: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
};

const MainLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  
  const navItems = [
    { name: 'Dispatch Queue', path: ROUTES.DASHBOARD, icon: Icons.tracking },
    { name: 'Global Radar', path: ROUTES.MAP, icon: Icons.map },
    { name: 'Inventory', path: '/inventory', icon: Icons.inventory },
    { name: 'Analytics', path: '/analytics', icon: Icons.analytics },
    { name: 'Settings', path: '/settings', icon: Icons.settings },
  ];

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  if (user?.role === 'DRIVER') {
    return <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#09090b' }}>{children}</div>;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#09090b', color: '#f4f4f5', fontFamily: 'system-ui, sans-serif' }}>
      
      <aside style={{ width: '220px', backgroundColor: '#18181b', borderRight: '1px solid #27272a', display: 'flex', flexDirection: 'column', zIndex: 50 }}>
        
        <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '24px', height: '24px', backgroundColor: '#3b82f6', borderRadius: '6px' }}></div>
          <div style={{ fontWeight: '800', fontSize: '1.2rem', letterSpacing: '-0.5px', color: '#ffffff' }}>Dispatch<span style={{color:'#3b82f6'}}>X</span></div>
        </div>

        <nav style={{ flex: 1, padding: '10px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ padding: '0 20px', fontSize: '0.65rem', fontWeight: '700', color: '#71717a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Main Menu</div>
          
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} to={item.path} 
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', textDecoration: 'none', 
                  color: isActive ? '#ffffff' : '#a1a1aa', fontSize: '0.85rem', fontWeight: isActive ? '600' : '500', 
                  backgroundColor: isActive ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                  borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ color: isActive ? '#3b82f6' : '#71717a' }}>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '20px', borderTop: '1px solid #27272a' }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '700', color: '#a1a1aa' }}>
                {user.name.charAt(0)}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#ffffff', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user.name}</div>
                <div style={{ fontSize: '0.7rem', color: '#71717a', fontWeight: '500' }}>{user.role}</div>
              </div>
            </div>
          )}
          <button 
            onClick={handleLogout} 
            style={{ width: '100%', background: 'transparent', border: '1px solid #3f3f46', color: '#a1a1aa', padding: '8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.borderColor = '#3f3f46'; }}
          >
            {Icons.logout} Sign Out
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, height: '100vh', overflow: 'hidden', position: 'relative' }}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;