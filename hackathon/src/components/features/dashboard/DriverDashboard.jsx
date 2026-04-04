import React, { useState, useEffect } from 'react';
import { useGlobalContext } from '../../../context/GlobalStore';
import { useAuth } from '../../../context/AuthContext';
import { useNotify } from '../../../context/NotificationContext';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// === КАСТОМНИЙ МАРКЕР З ІКОНКОЮ ===
const createCustomMarker = (isActive) => new L.DivIcon({
  className: 'custom-driver-marker',
  html: `
    <div style="
      background-color: ${isActive ? '#3b82f6' : '#27272a'};
      border: 3px solid #ffffff;
      width: 36px; height: 36px;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      color: white;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
      </svg>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Контролер для центрування карти
const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 12, { animate: true, duration: 1 });
  }, [center, map]);
  return null;
};

const DriverDashboard = () => {
  const { requests, updateRequestStatus } = useGlobalContext();
  const { logout } = useAuth();
  const { showNotification } = useNotify();

  const activeRoute = requests.filter(r => ['IN_TRANSIT', 'DELAYED'].includes(r.status));
  const [selectedPointId, setSelectedPointId] = useState(activeRoute[0]?.id);

  const currentPoint = activeRoute.find(r => r.id === selectedPointId) || activeRoute[0];

  const handleDelivery = (id) => {
    updateRequestStatus(id, 'DELIVERED');
    showNotification('Cargo successfully unloaded.', 'success');
    const remaining = activeRoute.filter(r => r.id !== id);
    if (remaining.length > 0) setSelectedPointId(remaining[0].id);
  };

  const handleSOS = (id) => {
    updateRequestStatus(id, 'DELAYED');
    showNotification('Issue reported. Dispatcher notified.', 'error');
  };

  if (activeRoute.length === 0) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', backgroundColor: '#09090b', color: '#a1a1aa' }}>
        <h2 style={{ color: '#fafafa', fontSize: '2rem', marginBottom: '8px', fontWeight: '700' }}>NO ACTIVE ROUTES</h2>
        <p style={{ marginBottom: '24px' }}>Awaiting dispatch orders from control center.</p>
        <button onClick={logout} style={{ padding: '12px 24px', backgroundColor: '#18181b', border: '1px solid #3f3f46', color: '#fafafa', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
          LOGOUT
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#09090b', overflow: 'hidden' }}>

      {/* 1. ЛІВА ЧАСТИНА: КАРТА (60-70% екрану) */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer center={currentPoint?.coords || [49.0, 31.0]} zoom={12} zoomControl={false} style={{ height: '100%', width: '100%', background: '#09090b' }}>
          <MapController center={currentPoint?.coords} />
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

          {activeRoute.map((req) => (
            <Marker
              key={req.id}
              position={req.coords || [49.0, 31.0]}
              icon={createCustomMarker(req.id === currentPoint.id)}
              eventHandlers={{ click: () => setSelectedPointId(req.id) }}
            >
              <Tooltip permanent={req.id === currentPoint.id} direction="top" offset={[0, -20]} className="custom-tooltip">
                <span style={{ fontWeight: '700', color: '#09090b', fontSize: '14px' }}>{req.location.split(',')[0]}</span>
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>

        {/* Кнопка виходу поверх карти */}
        <button
          onClick={logout}
          style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 1000, padding: '10px 16px', backgroundColor: '#18181b', border: '1px solid #3f3f46', color: '#a1a1aa', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
        >
          Exit Route
        </button>
      </div>

      {/* 2. ПРАВА ПАНЕЛЬ: DIGITAL WAYBILL (Фіксована ширина, чітка структура) */}
      <div style={{ width: '420px', backgroundColor: '#18181b', borderLeft: '1px solid #27272a', display: 'flex', flexDirection: 'column', zIndex: 10 }}>

        {/* СЕКЦІЯ 1: FLEET STATUS (Хедер) */}
        <div style={{ padding: '24px', borderBottom: '1px solid #27272a', backgroundColor: '#18181b' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
            Fleet Status
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#3b82f6' }}>ACTIVE ROUTE</div>
            <div style={{ fontSize: '0.9rem', color: '#a1a1aa', fontWeight: '500' }}>{activeRoute.length} stops left</div>
          </div>
        </div>

        {/* СЕКЦІЯ 2: ВИБІР ЗУПИНКИ */}
        <div style={{ display: 'flex', overflowX: 'auto', padding: '16px 24px', gap: '8px', borderBottom: '1px solid #27272a', backgroundColor: '#09090b' }}>
          {activeRoute.map((req, index) => (
            <div
              key={req.id} onClick={() => setSelectedPointId(req.id)}
              style={{
                padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap',
                backgroundColor: selectedPointId === req.id ? '#3b82f6' : '#27272a',
                border: `1px solid ${selectedPointId === req.id ? '#3b82f6' : '#3f3f46'}`,
              }}
            >
              <div style={{ fontSize: '0.7rem', fontWeight: '700', color: selectedPointId === req.id ? '#e0e7ff' : '#a1a1aa', marginBottom: '2px' }}>
                STOP {index + 1}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: selectedPointId === req.id ? '#ffffff' : '#e4e4e7' }}>
                {req.location.split(',')[0]}
              </div>
            </div>
          ))}
        </div>

        {/* СЕКЦІЯ 3: ІНФОРМАЦІЯ ПРО ВАНТАЖ ТА ТОЧКУ (Скролиться) */}
        {currentPoint && (
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Локація */}
            <div>
              <div style={{ color: '#a1a1aa', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                Destination Address
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#ffffff', lineHeight: '1.3' }}>
                {currentPoint.location}
              </div>
            </div>

            {/* Блок вантажу (Більш виразний, компактний) */}
            <div style={{ backgroundColor: '#27272a', borderRadius: '12px', padding: '20px', border: '1px solid #3f3f46', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#a1a1aa', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                  Cargo Type
                </div>
                <div style={{ fontSize: '1.2rem', color: '#ffffff', fontWeight: '600' }}>
                  {currentPoint.items}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#a1a1aa', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                  Quantity
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '2.2rem', color: '#3b82f6', fontWeight: '800', lineHeight: '1' }}>
                    {currentPoint.quantity}
                  </span>
                  <span style={{ fontSize: '1rem', color: '#a1a1aa', fontWeight: '500' }}>
                    units
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* СЕКЦІЯ 4: ДІЇ (Фіксовані внизу) */}
        {currentPoint && (
          <div style={{ padding: '24px', borderTop: '1px solid #27272a', backgroundColor: '#18181b', display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* PRIMARY ACTION: Підтвердження */}
            <button
              onClick={() => handleDelivery(currentPoint.id)}
              style={{ width: '100%', padding: '18px', backgroundColor: '#3b82f6', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer', transition: '0.2s', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}
            >
              CONFIRM UNLOAD
            </button>

            {/* SECONDARY ACTION: Менш помітна, outline */}
            {currentPoint.status === 'DELAYED' ? (
              <div style={{ width: '100%', padding: '14px', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '8px', textAlign: 'center', fontSize: '0.9rem', fontWeight: '600' }}>
                Issue Reported
              </div>
            ) : (
              <button
                onClick={() => handleSOS(currentPoint.id)}
                style={{ width: '100%', padding: '14px', backgroundColor: 'transparent', border: '1px solid #3f3f46', color: '#a1a1aa', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', transition: '0.2s' }}
              >
                Report delay / issue
              </button>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default DriverDashboard;