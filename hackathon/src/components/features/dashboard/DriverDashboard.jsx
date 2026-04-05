import React, { useState, useEffect } from 'react';
import { useGlobalContext } from '../../../context/GlobalStore';
import { useAuth } from '../../../context/AuthContext';
import { useNotify } from '../../../context/NotificationContext';
import { useLang } from '../../../context/LanguageContext';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MAIN_HUB_COORDS = [50.4501, 30.5234];

const tx = (t, key, fallback) => {
  const result = t(key);
  return result && result !== key ? result : fallback;
};

const createCustomMarker = (isActive, isCompleted, index) =>
  new L.DivIcon({
    className: 'clear-marker',
    html: `<div style="
      background-color: ${isCompleted ? '#22c55e' : isActive ? '#3b82f6' : '#27272a'};
      border: 3px solid ${isCompleted ? '#16a34a' : isActive ? '#ffffff' : '#3f3f46'};
      width: ${isActive ? '40px' : '32px'};
      height: ${isActive ? '40px' : '32px'};
      border-radius: 50%;
      box-shadow: ${isActive ? '0 0 20px rgba(59,130,246,0.7)' : '0 4px 12px rgba(0,0,0,0.5)'};
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: ${isActive ? '13px' : '11px'}; font-weight: 800;
      transition: all 0.3s;
    ">${isCompleted ? '✓' : index + 1}</div>`,
    iconSize:   [isActive ? 40 : 32, isActive ? 40 : 32],
    iconAnchor: [isActive ? 20 : 16, isActive ? 20 : 16],
  });

const hubIcon = new L.DivIcon({
  className: 'clear-marker',
  html: `<div style="
    width:28px;height:28px;border-radius:8px;
    background:#18181b;border:2px solid #3b82f6;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 0 14px rgba(59,130,246,0.6);">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
      <path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-3"/>
    </svg>
  </div>`,
  iconSize:   [28, 28],
  iconAnchor: [14, 14],
});

const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 10, { animate: true, duration: 1 });
  }, [center, map]);
  return null;
};

const FitBounds = ({ stops }) => {
  const map = useMap();
  useEffect(() => {
    if (!stops.length) return;
    const points = [MAIN_HUB_COORDS, ...stops.map(s => s.coords).filter(Boolean)];
    if (points.length < 2) return;
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 9, animate: true, duration: 1 });
  }, [stops, map]);
  return null;
};

const DriverDashboard = () => {
  const { requests, updateRequestStatus } = useGlobalContext();
  const { logout }          = useAuth();
  const { showNotification } = useNotify();
  const { t, theme }        = useLang();

  // Активні маршрути — доставлені вже відфільтровані (статус DELIVERED не входить)
  const activeRoute = requests.filter(r =>
    ['IN_TRANSIT', 'DELAYED'].includes(r.status)
  );

  const [selectedPointId, setSelectedPointId] = useState(activeRoute[0]?.id ?? null);
  // completedIds — лише для візуального відображення маркерів на карті
  const [completedIds, setCompletedIds] = useState([]);

  const currentPoint = activeRoute.find(r => r.id === selectedPointId) ?? activeRoute[0] ?? null;

  const tileUrl = theme === 'light'
    ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

  const handleDelivery = (id) => {
    updateRequestStatus(id, 'DELIVERED');
    // Зберігаємо для анімації карти до того як компонент ре-рендериться
    setCompletedIds(prev => [...prev, id]);
    showNotification(
      tx(t, 'cargo_unloaded', 'Cargo successfully unloaded.'),
      'success'
    );
   
    const remaining = activeRoute.filter(r => r.id !== id);
    if (remaining.length > 0) setSelectedPointId(remaining[0].id);
  };

  const handleSOS = (id) => {
    updateRequestStatus(id, 'DELAYED');
    showNotification(
      tx(t, 'issue_reported_toast', 'Issue reported. Dispatcher notified.'),
      'warning'
    );
  };

  if (activeRoute.length === 0) {
    return (
      <div className="driver-no-route">
        <div className="driver-no-route-card">
          <div className="driver-no-route-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5">
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5"  cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>

          <h2 style={{ color: '#f4f4f5', fontSize: '1.2rem', fontWeight: 800, margin: '16px 0 8px', textAlign: 'center' }}>
            {tx(t, 'no_active_routes', 'No Active Route')}
          </h2>

          <p style={{ color: '#71717a', fontSize: '0.9rem', marginBottom: 24, textAlign: 'center', lineHeight: 1.5 }}>
            {tx(t, 'awaiting_dispatch', 'Awaiting dispatch assignment from the control center.')}
          </p>

          <button onClick={logout} className="driver-logout-btn">
            {tx(t, 'sign_out', 'Sign Out')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="driver-root">

      {/* ── MAP ── */}
      <div className="driver-map-wrapper">
        <MapContainer
          center={currentPoint?.coords ?? MAIN_HUB_COORDS}
          zoom={8}
          zoomControl={false}
          style={{ width: '100%', height: '100%' }}
        >
          {activeRoute.length > 1
            ? <FitBounds stops={activeRoute} />
            : <MapController center={currentPoint?.coords} />
          }

          <TileLayer key={theme} url={tileUrl} />

          <Marker position={MAIN_HUB_COORDS} icon={hubIcon}>
            <Tooltip direction="top" offset={[0, -18]}>
              <span style={{ fontWeight: 700, color: '#09090b', fontSize: 12 }}>
                Main Hub
              </span>
            </Tooltip>
          </Marker>

          {activeRoute.map((req, idx) => {
            const isActive    = req.id === selectedPointId;
            const isCompleted = completedIds.includes(req.id);
            const path        = req.routePath ?? [MAIN_HUB_COORDS, req.coords];

            return (
              <React.Fragment key={req.id}>
                <Polyline
                  positions={path}
                  pathOptions={{
                    color:     isCompleted ? '#22c55e' : isActive ? '#3b82f6' : '#3f3f46',
                    weight:    isActive ? 4 : 2,
                    opacity:   isActive ? 0.9 : 0.45,
                    dashArray: isCompleted ? null : '10 12',
                  }}
                />
                <Marker
                  position={req.coords ?? MAIN_HUB_COORDS}
                  icon={createCustomMarker(isActive, isCompleted, idx)}
                  eventHandlers={{ click: () => setSelectedPointId(req.id) }}
                >
                  <Tooltip permanent={isActive} direction="top" offset={[0, -22]}>
                    <span style={{ fontWeight: 700, color: '#09090b', fontSize: 13 }}>
                      {req.location.split(',')[0]}
                    </span>
                  </Tooltip>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>

     
        <div className="driver-map-overlay">
          <div className="driver-map-badge">
            <span className="driver-map-badge-dot" />
            {tx(t, 'fleet_status', 'ACTIVE ROUTE')}
          </div>
          <div className="driver-map-stops-count">
            <span style={{ color: '#3b82f6', fontWeight: 800 }}>
              {activeRoute.length}
            </span>
            <span style={{ color: '#a1a1aa', fontSize: '0.7rem', marginLeft: 4 }}>
              {tx(t, 'stops_left', 'stops left')}
            </span>
          </div>
        </div>

        <button onClick={logout} className="driver-exit-btn">
          {tx(t, 'exit_route', 'Exit')}
        </button>
      </div>

      {/* ── SIDE PANEL ── */}
      <div className="driver-panel">

        <div className="driver-panel-header">
          <div>
            <div className="driver-panel-label">
              {tx(t, 'fleet_status', 'FLEET STATUS')}
            </div>
            <div className="driver-panel-title">
              {tx(t, 'active_route', 'ACTIVE ROUTE')}
            </div>
          </div>
          <div className="driver-panel-stops-badge">
            {activeRoute.length} {tx(t, 'stops_label', 'Stops')}
          </div>
        </div>

        <div className="driver-tabs-row">
          {activeRoute.map((req, index) => {
            const isActive    = selectedPointId === req.id;
            const isCompleted = completedIds.includes(req.id);
            return (
              <button
                key={req.id}
                onClick={() => setSelectedPointId(req.id)}
                className={[
                  'driver-tab',
                  isActive    ? 'driver-tab-active'    : '',
                  isCompleted ? 'driver-tab-completed' : '',
                ].join(' ').trim()}
              >
                <span className="driver-tab-label">
                  {isCompleted
                    ? `✓ ${tx(t, 'delivered_label', 'DELIVERED')}`
                    : `${tx(t, 'stop_label', 'STOP')} ${index + 1}`}
                </span>
                <span className="driver-tab-name">
                  {req.location.split(',')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {currentPoint && (
          <div className="driver-panel-content">

            <div>
              <div className="driver-field-label">
                {tx(t, 'destination_address', 'DESTINATION')}
              </div>
              <div className="driver-destination">{currentPoint.location}</div>
            </div>

            <div className="driver-cargo-card">
              <div className="driver-cargo-row">
                <div>
                  <div className="driver-field-label">
                    {tx(t, 'cargo_type', 'CARGO TYPE')}
                  </div>
                  <div className="driver-cargo-name">
                    {tx(t, currentPoint.items, currentPoint.items)}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="driver-field-label">
                    {tx(t, 'quantity', 'QUANTITY')}
                  </div>
                  <div className="driver-cargo-qty">
                    <span className="driver-cargo-qty-num">
                      {currentPoint.quantity.toLocaleString()}
                    </span>
                    <span className="driver-cargo-qty-unit">
                      {tx(t, 'units', 'Units')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="driver-stock-block">
                <div className="driver-stock-header">
                  <span className="driver-field-label" style={{ margin: 0 }}>
                    {tx(t, 'stock_at_destination', 'Stock level at destination')}
                  </span>
                  <span className={`driver-stock-pct ${currentPoint.currentStock < 20 ? 'danger' : ''}`}>
                    {currentPoint.currentStock}%
                  </span>
                </div>

                <div className="driver-stock-bar-bg">
                  <div
                    className="driver-stock-bar-fill"
                    style={{
                      width:      `${currentPoint.currentStock}%`,
                      background: currentPoint.currentStock < 20 ? '#ef4444' : '#3b82f6',
                    }}
                  />
                </div>

                {currentPoint.currentStock < 20 && (
                  <div className="driver-critical-badge">
                    ⚠ {tx(t, 'critically_low', 'Critically low stock level')}
                  </div>
                )}
              </div>
            </div>

            {currentPoint.status === 'DELAYED' && (
              <div className="driver-delayed-banner">
                <span>🔴</span>
                <span>{tx(t, 'issue_reported_banner', 'Issue reported — dispatcher has been notified.')}</span>
              </div>
            )}

          </div>
        )}

        {currentPoint && (
          <div className="driver-actions">
            <button
              onClick={() => handleDelivery(currentPoint.id)}
              className="driver-btn-confirm"
            >
              {tx(t, 'confirm_unload', 'CONFIRM UNLOAD')}
            </button>

            {currentPoint.status === 'DELAYED' ? (
              <div className="driver-issue-reported">
                🔴 &nbsp;{tx(t, 'issue_reported_label', 'Issue Reported')}
              </div>
            ) : (
              <button
                onClick={() => handleSOS(currentPoint.id)}
                className="driver-btn-issue"
              >
                {tx(t, 'report_delay_issue', 'Report delay / issue')}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default DriverDashboard;