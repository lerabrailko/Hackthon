import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';
import LoginForm from '../components/features/auth/LoginForm';

const LoginPage = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-dark)',
      }}
    >
      <div
        className="animate-in"
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '40px',
          backgroundColor: 'var(--bg-panel)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'var(--accent)',
                borderRadius: '8px',
              }}
            />
          </div>
          <h1
            style={{
              fontSize: '1.8rem',
              fontWeight: '800',
              marginBottom: '8px',
              letterSpacing: '-0.5px',
            }}
          >
            Dispatch<span style={{ color: 'var(--accent)' }}>X</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Authentication System
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;