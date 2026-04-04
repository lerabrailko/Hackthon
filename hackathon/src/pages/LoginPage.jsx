import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { ROUTES } from '../constants/routes';

const LoginPage = () => {
  const { t } = useLang();
  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  // Захист маршруту: якщо вже авторизовані, йдемо на дашборд
  if (user) {
    return <Navigate to={ROUTES.DASHBOARD || '/'} replace />;
  }

  // Стан форми
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER');
  
  // Стан помилок та завантаження
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    
    // Валідація
    const errors = {};
    if (!username.trim()) errors.username = true;
    if (!password.trim()) errors.password = true;
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (isRegisterMode) {
        if (register) {
          await register(username, password, role);
        } else {
          console.warn("Register function not implemented in AuthContext");
          await login(username, password);
        }
      } else {
        await login(username, password);
      }
      navigate(ROUTES.DASHBOARD || '/');
    } catch (err) {
      setError(err.message || 'Access Denied. Invalid credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-container animate-in">
        
        {/* Шапка з логотипом (з нової версії) */}
        <div className="auth-header">
          <div className="auth-logo-wrapper">
            <div className="auth-logo"></div>
          </div>
          <h1 className="auth-title">
            {isRegisterMode ? t('register_btn') : (t('login_title') || 'Right Direction')}
          </h1>
          <p className="auth-subtitle">Authentication System</p>
        </div>
        
        <form onSubmit={handleSubmit} className="settings-section">
          {/* Глобальна помилка */}
          {error && (
            <div className="auth-error-msg">
              {error}
            </div>
          )}

          {/* Поле Логін */}
          <div className="settings-form-group">
            <label className="settings-label">{t('login_id')}</label>
            <input 
              className={`settings-input ${fieldErrors.username ? 'input-error' : ''}`}
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              onFocus={() => setFieldErrors(prev => ({ ...prev, username: false }))}
              placeholder={isRegisterMode ? t('create_id') : "e.g. admin"}
            />
          </div>
          
          {/* Поле Пароль */}
          <div className="settings-form-group">
            <label className="settings-label">{t('password')}</label>
            <input 
              className={`settings-input ${fieldErrors.password ? 'input-error' : ''}`}
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              onFocus={() => setFieldErrors(prev => ({ ...prev, password: false }))}
              placeholder={isRegisterMode ? t('create_password') : "••••••••"}
            />
          </div>

          {/* Вибір ролі (тільки при реєстрації) */}
          {isRegisterMode && (
            <div className="settings-form-group">
              <label className="settings-label">{t('your_role')}</label>
              <select 
                className="settings-select" 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="CUSTOMER">{t('role_client')}</option>
                <option value="DISPATCHER">{t('role_dispatcher')}</option>
              </select>
            </div>
          )}
          
          {/* Кнопка відправки */}
          <div className="settings-submit-wrapper mt-large">
            <button 
              className={`settings-btn-save auth-submit-btn ${isSubmitting ? 'processing' : ''}`} 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? t('processing') : (isRegisterMode ? t('register_btn') : t('login_btn'))}
            </button>
          </div>
        </form>

        {/* Перемикач режимів */}
        <div className="auth-toggle-wrapper">
          <button 
            type="button" 
            onClick={() => { 
              setIsRegisterMode(!isRegisterMode); 
              setError(''); 
              setFieldErrors({}); 
            }}
            className="auth-toggle-btn"
          >
            {isRegisterMode ? t('link_login') : t('link_register')}
          </button>
        </div>

        {/* Підказки */}
        {!isRegisterMode && (
          <div className="auth-hints text-center mt-small">
            {t('login_hints')}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;