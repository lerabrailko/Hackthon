import React from 'react';

const AuthLayout = ({ children }) => (
  <div style={{
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a'
  }}>
    <div style={{ backgroundColor: '#1e293b', padding: '40px', borderRadius: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
      {children}
    </div>
  </div>
);

export default AuthLayout;