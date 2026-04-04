import React, { useState, useEffect } from 'react';
import { useGlobalContext } from '../context/GlobalStore';
import { useNotify } from '../context/NotificationContext';
import { useLang } from '../context/LanguageContext';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Icons = {
  hub: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M3 21h18"></path><path d="M5 21V7l8-4v18"></path><path d="M19 21V11l-6-3"></path><path d="M9 9v2"></path><path d="M9 13v2"></path></svg>`,
  truck: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`,
  alert: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
};

const createMarker = (type, isSelected) => {
  let typeClass = 'marker-default';
  let icon = '';

  if (type === 'HUB') { typeClass = 'marker-hub'; icon = Icons.hub; }
  else if (type === 'IN_TRANSIT') { typeClass = 'marker-transit'; icon = Icons.truck; }
  else if (type === 'CRITICAL' || type === 'DELAYED') { typeClass = 'marker-critical pulse-ring'; icon = Icons.alert; }

  const scaleClass = isSelected ? 'marker-selected' : '';

  return new L.DivIcon({
    className: 'custom-leaflet-marker',
    html: `<div class="custom-marker-icon ${typeClass} ${scaleClass}">${icon}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 8, { animate: true, duration: 1.2 });
  }, [center, map]);
  return null;
};

const MapPage = () => {
  const { requests, updateRequestStatus } = useGlobalContext();
  const { showNotification } = useNotify();
  const { t } = useLang();
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const MAIN_HUB_COORDS = [50.4501, 30.5234];

  const inTransit = requests.filter(r => r.status === 'IN_TRANSIT');
  const criticalAlerts = requests.filter(r => (r.currentStock < 20 || r.status === 'DELAYED') && r.status !== 'DELIVERED');

  const selectedNode = selectedNodeId === 'MAIN_HUB'
    ? { id: 'MAIN_HUB', location: 'Kyiv Central Hub', status: 'HUB' }
    : requests.find(r => r.id === selectedNodeId);

  const handleResolveAlert = (id) => {
    updateRequestStatus(id, 'IN_TRANSIT');
    showNotification('Crisis resolved. Fleet operations normalized.', 'success');
    setSelectedNodeId(null);
  };

  return (
    <div className="map-page-layout">

      {/* KPI HEADER */}
      <header className="map-kpi-header">
        <div className="kpi-block border-right">
          <span className="kpi-label">{t('total_nodes') || 'Active Network Nodes'}</span>
          <span className="kpi-value">{requests.filter(r => r.status !== 'DELIVERED').length}</span>
        </div>
        <div className="kpi-block border-right">
          <span className="kpi-label text-accent">{t('fleet_transit') || 'Fleet In Transit'}</span>
          <span className="kpi-value text-accent">{inTransit.length} {t('trucks') || 'Trucks'}</span>
        </div>
        <div className={`kpi-block border-right ${criticalAlerts.length > 0 ? 'bg-danger-light' : ''}`}>
          <span className={`kpi-label ${criticalAlerts.length > 0 ? 'text-danger-light' : ''}`}>
            {t('critical_alerts') || 'Critical Incidents'}
          </span>
          <span className={`kpi-value ${criticalAlerts.length > 0 ? 'text-danger' : ''}`}>
            {criticalAlerts.length} {t('active') || 'Active'}
          </span>
        </div>
        <div className="kpi-block flex-row-center">
          <div className={`status-dot ${criticalAlerts.length > 0 ? 'dot-danger' : 'dot-success'}`}></div>
          <div>
            <div className="kpi-label">{t('system_status') || 'System Status'}</div>
            <div className={`status-text ${criticalAlerts.length > 0 ? 'text-danger' : 'text-success'}`}>
              {criticalAlerts.length > 0 ? (t('action_required') || 'Action Required') : (t('Operational') || 'Operational')}
            </div>
          </div>
        </div>
      </header>

      {/* MAP + PANEL */}
      <div className="map-main-content">

        {/* КАРТА — використовує map-fullscreen-wrapper */}
        <div className="map-fullscreen-wrapper">
          <MapContainer
            center={[49.0, 31.0]}
            zoom={6}
            zoomControl={false}
            className="full-map-no-radius"
          >
            <MapController center={selectedNode?.coords} />

            {/* OSM тайли — темний вигляд через CSS filter у .leaflet-tile-pane */}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            {/* Hub marker */}
            <Marker
              position={MAIN_HUB_COORDS}
              icon={createMarker('HUB', selectedNodeId === 'MAIN_HUB')}
              eventHandlers={{ click: () => setSelectedNodeId('MAIN_HUB') }}
            />

            {/* Routes */}
            {inTransit.map(req => {
              const positions = req.routePath || [MAIN_HUB_COORDS, req.coords];
              return (
                <Polyline
                  key={`route-${req.id}`}
                  positions={positions}
                  pathOptions={{ color: '#3b82f6', weight: 3, opacity: 0.8, dashArray: '10, 15' }}
                />
              );
            })}

            {/* Node markers */}
            {requests.filter(r => r.status !== 'DELIVERED').map(req => {
              const isCritical = req.currentStock < 20 || req.status === 'DELAYED';
              const markerType = isCritical ? 'CRITICAL' : (req.status === 'IN_TRANSIT' ? 'IN_TRANSIT' : 'DEFAULT');
              return (
                <Marker
                  key={req.id}
                  position={req.coords}
                  icon={createMarker(markerType, selectedNodeId === req.id)}
                  eventHandlers={{ click: () => setSelectedNodeId(req.id) }}
                />
              );
            })}
          </MapContainer>
        </div>

        {/* TELEMETRY PANEL */}
        <div className="telemetry-panel">
          {selectedNode ? (
            <div className="telemetry-content animate-in">
              <div className="telemetry-header">
                <div>
                  <div className="telemetry-subtitle">{t('node_telemetry') || 'Node Telemetry'}</div>
                  <h2 className="telemetry-title">{selectedNode.location}</h2>
                </div>
                <button onClick={() => setSelectedNodeId(null)} className="btn-close-panel">
                  ✕ {t('close')}
                </button>
              </div>

              {selectedNode.id !== 'MAIN_HUB' ? (
                <div className="telemetry-body">
                  <div className="telemetry-card">
                    <div className="card-label">{t('active_request') || 'Active Request / Cargo'}</div>
                    <div className="card-value">{t(selectedNode.items)}</div>
                    <div className="card-subvalue">{selectedNode.quantity?.toLocaleString()} {t('units_expected') || 'units expected'}</div>
                  </div>

                  <div>
                    <div className="stock-header">
                      <span className="stock-label">{t('dest_stock') || 'Facility Stock Level'}</span>
                      <span className={`stock-percent ${selectedNode.currentStock < 20 ? 'text-danger' : ''}`}>
                        {selectedNode.currentStock}%
                      </span>
                    </div>
                    <div className="stock-bar-bg">
                      <div
                        className={`stock-bar-fill ${selectedNode.currentStock < 20 ? 'bg-danger' : 'bg-accent'}`}
                        style={{ width: `${selectedNode.currentStock}%` }}
                      />
                    </div>
                  </div>

                  {(selectedNode.status === 'DELAYED' || selectedNode.currentStock < 20) && (
                    <div className="crisis-protocol-box animate-in">
                      <div className="crisis-header">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        <span>{t('crisis_protocol') || 'Crisis Protocol'}</span>
                      </div>
                      <div className="crisis-description">
                        {selectedNode.status === 'DELAYED'
                          ? (t('driver_delayed_msg') || 'Driver reported a critical issue on the route.')
                          : (t('low_stock_msg') || 'Stock below critical levels (20%). High risk of supply failure.')}
                      </div>
                      <div className="crisis-actions">
                        <button onClick={() => showNotification('Rerouting backup fleet...', 'info')} className="btn-reroute">
                          {t('reroute_backup') || 'Reroute Nearest Backup'}
                        </button>
                        {selectedNode.status === 'DELAYED' && (
                          <button onClick={() => handleResolveAlert(selectedNode.id)} className="btn-resolve">
                            {t('mark_resolved') || 'Mark Issue as Resolved'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hub-description">
                  <strong>{t('main_hub_desc_strong') || 'Central Distribution Hub.'}</strong><br />
                  {t('main_hub_desc_sub') || 'Origin point for all fleets.'}
                </div>
              )}
            </div>
          ) : (
            <div className="feed-content animate-in">
              <div className="feed-header">
                <div>
                  <h2 className="feed-title">{t('global_feed') || 'Global Incidents'}</h2>
                  <p className="feed-subtitle">{t('network_anomalies') || 'Network anomalies and active routes.'}</p>
                </div>
              </div>
              <div className="feed-list">
                {requests
                  .filter(r => r.status !== 'DELIVERED')
                  .sort((a, b) => (a.currentStock < 20 || a.status === 'DELAYED') ? -1 : 1)
                  .map(req => {
                    const isAlert = req.currentStock < 20 || req.status === 'DELAYED';
                    return (
                      <div
                        key={req.id}
                        onClick={() => setSelectedNodeId(req.id)}
                        className={`feed-item ${isAlert ? 'feed-item-alert' : ''}`}
                      >
                        <div className="feed-item-header">
                          <span className="feed-item-location">{req.location.split(',')[0]}</span>
                          <span className={`feed-item-status ${isAlert ? 'status-alert' : (req.status === 'IN_TRANSIT' ? 'status-transit' : '')}`}>
                            {isAlert ? (t('Alert') || 'Alert') : t(req.status)}
                          </span>
                        </div>
                        <div className="feed-item-cargo">{t('cargo')}: {t(req.items)}</div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapPage;