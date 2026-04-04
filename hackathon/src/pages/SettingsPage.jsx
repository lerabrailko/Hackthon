import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext'; 
import { useNotify } from '../context/NotificationContext';

const SettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const { 
    lang, changeLanguage, 
    theme, changeTheme, 
    t 
  } = useLang();
  const { showNotification } = useNotify();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [saveStatus, setSaveStatus] = useState('idle');
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || null,
    role: user?.role || 'LOGISTICIAN'
  });

  const [notifs, setNotifs] = useState({
    email: user?.notifications?.email ?? true,
    sms: user?.notifications?.sms ?? false,
    push: user?.notifications?.push ?? false,
  });

  const [sec, setSec] = useState({
    twoFactor: user?.security?.twoFactor ?? false,
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || null,
        role: user.role || 'LOGISTICIAN'
      });
      if (user.notifications) setNotifs(prev => ({ ...prev, email: user.notifications.email ?? true, sms: user.notifications.sms ?? false, push: user.notifications.push ?? false }));
      if (user.security) setSec(prev => ({ ...prev, twoFactor: user.security.twoFactor ?? false }));
    }
  }, [user]);

  const handlePushToggle = async (e) => {
    const isChecked = e.target.checked;
    setNotifs(prev => ({ ...prev, push: isChecked }));

    if (isChecked) {
      if (!('Notification' in window)) {
        showNotification('Browser does not support notifications', 'danger', true);
        setNotifs(prev => ({ ...prev, push: false }));
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('LOGITECH.AI', { 
          body: t('push_enabled_msg'), 
          icon: '/favicon.svg' 
        });
        showNotification(t('push_enabled_msg'), 'success', true);
      } else {
        setNotifs(prev => ({ ...prev, push: false }));
        showNotification(t('push_blocked_msg'), 'danger', true);
      }
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, avatar: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordUpdate = () => {
    if (!currentPassword || !newPassword) {
      showNotification('Please fill in both password fields.', 'danger', true);
      return;
    }
    showNotification(t('two_factor_msg') ? 'Password update request sent.' : 'Password update request sent.', 'info', true);
    setCurrentPassword('');
    setNewPassword('');
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaveStatus('saving');
    
    setTimeout(() => {
      if (updateProfile) {
        updateProfile({
          ...formData,
          notifications: notifs,
          security: sec
        });
      }
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  };

  return (
    <div className="settings-container animate-in">
      <h1 className="settings-header">{t('settings_title')}</h1>
      
      <div className="settings-tabs settings-tabs-scrollable">
        {['profile', 'appearance', 'notifications', 'security'].map((tab) => (
          <button 
            key={tab}
            className={`settings-tab-btn ${activeTab === tab ? 'active' : ''}`} 
            onClick={() => setActiveTab(tab)}
          >
            {t(`tab_${tab}`)}
          </button>
        ))}
      </div>

      <div className="settings-card settings-card-wide">
        <form onSubmit={handleSave} className="settings-section">
          
          {/* Вкладка профілю */}
          {activeTab === 'profile' && (
            <div className="animate-in">
              <div className="avatar-upload-container">
                <div className="avatar-preview" onClick={() => fileInputRef.current.click()}>
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Avatar" />
                  ) : (
                    <span className="avatar-placeholder">{formData.name ? formData.name.charAt(0) : '?'}</span>
                  )}
                </div>
                <div className="avatar-actions">
                  <button type="button" onClick={() => fileInputRef.current.click()} className="settings-btn-save btn-small">
                    {t('upload_photo')}
                  </button>
                  {formData.avatar && (
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, avatar: null }))} className="btn-text-danger">
                      {t('remove_photo')}
                    </button>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden-input" />
                </div>
              </div>

              <div className="settings-grid">
                <div className="settings-form-group">
                  <label className="settings-label">{t('full_name')}</label>
                  <input type="text" className="settings-input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                </div>
                
                <div className="settings-form-group">
                  <label className="settings-label">{t('system_role')}</label>
                  <select 
                    className="settings-select" 
                    value={formData.role} 
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="LOGISTICIAN">Логіст (Адміністратор)</option>
                    <option value="WAREHOUSE">Представник складу</option>
                    <option value="DELIVERY_POINT">Точка доставки</option>
                  </select>
                </div>

                <div className="settings-form-group">
                  <label className="settings-label">{t('email_label')}</label>
                  <input type="email" className="settings-input" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="settings-form-group">
                  <label className="settings-label">{t('phone_label')}</label>
                  <input type="tel" className="settings-input" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
            </div>
          )}

          {/* Вкладка зовнішнього вигляду */}
          {activeTab === 'appearance' && (
            <div className="animate-in settings-section-spaced">
              <div className="settings-form-group">
                <label className="settings-label">{t('lang_label')}</label>
                <select className="settings-select" value={lang} onChange={(e) => changeLanguage(e.target.value)}>
                  <option value="en">English</option>
                  <option value="uk">Українська</option>
                </select>
              </div>
              <div className="settings-form-group">
                <label className="settings-label">{t('theme_label')}</label>
                <select className="settings-select" value={theme} onChange={(e) => changeTheme(e.target.value)}>
                  <option value="dark">{t('theme_dark')}</option>
                  <option value="light">{t('theme_light')}</option>
                </select>
              </div>
            </div>
          )}

          {/* Вкладка сповіщень */}
          {activeTab === 'notifications' && (
            <div className="animate-in settings-section-spaced">
              <h3 className="settings-section-title">{t('notif_title')}</h3>
              <p className="settings-text-muted mt-minus-8">{t('notif_desc')}</p>
              
              <div className="switch-group">
                <div className="switch-wrapper">
                  <span>{t('notif_email')}</span>
                  <label className="switch">
                    <input type="checkbox" checked={notifs.email} onChange={(e) => setNotifs({...notifs, email: e.target.checked})} />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="switch-wrapper">
                  <span>{t('notif_sms')}</span>
                  <label className="switch">
                    <input type="checkbox" checked={notifs.sms} onChange={(e) => setNotifs({...notifs, sms: e.target.checked})} />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="switch-wrapper">
                  <span>{t('notif_push')}</span>
                  <label className="switch">
                    <input type="checkbox" checked={notifs.push} onChange={handlePushToggle} />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Вкладка безпеки */}
          {activeTab === 'security' && (
            <div className="animate-in settings-section-spaced">
              <h3 className="settings-section-title">{t('sec_title')}</h3>
              <p className="settings-text-muted mt-minus-8">{t('sec_desc')}</p>

              {/* Перемикач 2FA */}
              <div className="switch-wrapper">
                <span className="font-bold">{t('sec_2fa')}</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={sec.twoFactor}
                    onChange={(e) => {
                      setSec({ ...sec, twoFactor: e.target.checked });
                      if (e.target.checked) showNotification(t('two_factor_msg'), 'success', true);
                    }}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <hr className="settings-divider" />

              {/* Зміна паролю */}
              <div className="settings-form-group">
                <label className="settings-label">{t('sec_password')}</label>
                <div className="password-row mb-10">
                  <input
                    type="password"
                    className="settings-input"
                    placeholder={t('sec_current_password')}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="password-row">
                  <input
                    type="password"
                    className="settings-input"
                    placeholder={t('sec_new_password')}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                  <button type="button" onClick={handlePasswordUpdate} className="btn-outline-secondary">
                    {t('sec_update')}
                  </button>
                </div>
              </div>
            </div>
          )}

          <hr className="settings-divider divider-lg" />

          <div className="settings-form-group">
            <button 
              type="submit" 
              className={`settings-btn-save ${saveStatus === 'saving' ? 'btn-saving' : ''}`}
              disabled={saveStatus === 'saving'}
            >
              {saveStatus === 'saving' ? t('processing') : t('save_btn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;