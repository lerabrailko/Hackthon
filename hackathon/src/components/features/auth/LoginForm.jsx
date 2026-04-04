import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ROUTES } from '../../../constants/routes';

const LoginForm = () => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errors = {};
    if (!username.trim()) errors.username = 'Please enter your ID.';
    if (!password.trim()) errors.password = 'Please enter your password.';
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      if (isRegisterMode) {
        await register(username, password, role);
      } else {
        await login(username, password);
      }
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setError(err.message || 'Access Denied. Invalid credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: '8px',
    border: '1px solid var(--border)', backgroundColor: 'var(--bg-dark)',
    color: 'white', outline: 'none', fontSize: '0.9rem', marginBottom: '16px'
  };

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column' }}>

      {error && (
        <div style={{ padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '8px', fontSize: '0.8rem', textAlign: 'center', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>
        {isRegisterMode ? 'NEW LOGIN ID' : 'LOGIN ID'}
      </label>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onFocus={() => setFieldErrors(prev => ({ ...prev, username: '' }))}
        placeholder={isRegisterMode ? 'Create an ID' : 'Enter ID'}
        style={{ ...inputStyle, borderColor: fieldErrors.username ? 'var(--danger)' : 'var(--border)', marginBottom: fieldErrors.username ? '4px' : '16px' }}
      />
      {fieldErrors.username && (
        <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginBottom: '16px' }}>
          {fieldErrors.username}
        </div>
      )}

      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>PASSWORD</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onFocus={() => setFieldErrors(prev => ({ ...prev, password: '' }))}
        placeholder={isRegisterMode ? 'Create a Password' : 'Enter Password'}
        style={{ ...inputStyle, borderColor: fieldErrors.password ? 'var(--danger)' : 'var(--border)', marginBottom: fieldErrors.password ? '4px' : '16px' }}
      />
      {fieldErrors.password && (
        <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginBottom: '16px' }}>
          {fieldErrors.password}
        </div>
      )}

      {isRegisterMode && (
        <>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>YOUR ROLE</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} style={inputStyle}>
            <option value="CUSTOMER">Client (Request Items)</option>
            <option value="DISPATCHER">Supplier/Dispatcher (Manage Deliveries)</option>
          </select>
        </>
      )}

      <button
        type="submit" disabled={isSubmitting}
        style={{
          width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
          backgroundColor: isSubmitting ? 'var(--border)' : 'var(--accent)',
          color: 'white', fontWeight: '600', cursor: isSubmitting ? 'not-allowed' : 'pointer',
          marginTop: '8px'
        }}
      >
        {isSubmitting ? 'PROCESSING...' : (isRegisterMode ? 'REGISTER' : 'LOGIN')}
      </button>

      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <button
          type="button"
          onClick={() => {
            setIsRegisterMode(!isRegisterMode);
            setError('');
            setFieldErrors({});
          }}
          style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.9rem' }}
        >
          {isRegisterMode ? 'Already have an account? Login' : "Don't have an account? Register"}
        </button>
      </div>
    </form>
  );
};

export default LoginForm;