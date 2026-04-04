import React, { useState, useEffect } from 'react';
import { useGlobalContext } from '../context/GlobalStore';
import { useNotify } from '../context/NotificationContext';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const styles = `
  .leaflet-container { background: #09090b !important; font-family: system-ui, sans-serif; border-radius: 0 !important; }
  .pulse-ring { animation: pulse 2s infinite; }
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5); }
    70% { box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); }
    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
  }
`;

const Icons = {
  hub: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M3 21h18"></path><path d="M5 21V7l8-4v18"></path><path d="M19 21V11l-6-3"></path><path d="M9 9v2"></path><path d="M9 13v2"></path></svg>`,
  truck: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`,
  alert: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
};

const createMarker = (type, isSelected) => {
  let bg = '#27272a'; let border = '#3f3f46'; let icon = ''; let extraClass = '';
  
  if (type === 'HUB') { bg = '#18181b'; border = '#3b82f6'; icon = Icons.hub; } 
  else if (type === 'IN_TRANSIT') { bg = '#2563eb'; border = '#60a5fa'; icon = Icons.truck; } 
  else if (type === 'CRITICAL' || type === 'DELAYED') { bg = '#ef4444'; border = '#f87171'; icon = Icons.alert; extraClass = 'pulse-ring'; }

  const scale = isSelected ? 'scale(1.2)' : 'scale(1)';
  const shadow = isSelected ? 'box-shadow: 0 0 0 4px rgba(255,255,255,0.2);' : 'box-shadow: 0 4px 6px rgba(0,0,0,0.3);';

  return new L.DivIcon({
    className: 'custom-marker',
    html: `<div class="${extraClass}" style="background: ${bg}; border: 2px solid ${border}; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transform: ${scale}; transition: all 0.2s; ${shadow}">${icon}</div>`,
    iconSize: [32, 32], iconAnchor: [16, 16]
  });
};

const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => { if (center) map.flyTo(center, 8, { animate: true, duration: 1.2 }); }, [center, map]);
  return null;
};

const MapPage = () => {
  const { requests, updateRequestStatus } = useGlobalContext();
  const { showNotification } = useNotify();
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const MAIN_HUB_COORDS = [50.4501, 30.5234]; 
  
  const inTransit = requests.filter(r => r.status === 'IN_TRANSIT');
  const criticalAlerts = requests.filter(r => (r.currentStock < 20 || r.status === 'DELAYED') && r.status !== 'DELIVERED');
  
  const selectedNode = selectedNodeId === 'MAIN_HUB' 
    ? { id: 'MAIN_HUB', location: 'Kyiv Central Hub', status: 'HUB', type: 'Distribution Center' } 
    : requests.find(r => r.id === selectedNodeId);

  const handleResolveAlert = (id) => {
    updateRequestStatus(id, 'IN_TRANSIT'); 
    showNotification('Crisis resolved. Fleet operations normalized.', 'success');
    setSelectedNodeId(null);
  };

  return (
    <div style={{ display: 'flex', height: '100%', backgroundColor: '#09090b', color: '#f4f4f5' }}>
      <style>{styles}</style>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        <header style={{ height: '80px', display: 'flex', backgroundColor: '#18181b', borderBottom: '1px solid #27272a' }}>
          <div style={{ flex: 1, padding: '0 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid #27272a' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#a1a1aa', textTransform: 'uppercase' }}>Active Network Nodes</span>
            <span style={{ fontSize: '1.4rem', fontWeight: '800' }}>{requests.filter(r=>r.status!=='DELIVERED').length}</span>
          </div>
          <div style={{ flex: 1, padding: '0 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid #27272a' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#60a5fa', textTransform: 'uppercase' }}>Fleet In Transit</span>
            <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#60a5fa' }}>{inTransit.length} Trucks</span>
          </div>
          <div style={{ flex: 1, padding: '0 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: criticalAlerts.length > 0 ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: criticalAlerts.length > 0 ? '#f87171' : '#a1a1aa', textTransform: 'uppercase' }}>Critical Incidents</span>
            <span style={{ fontSize: '1.4rem', fontWeight: '800', color: criticalAlerts.length > 0 ? '#ef4444' : '#f4f4f5' }}>{criticalAlerts.length} Active</span>
          </div>
        </header>

        <div style={{ flex: 1, position: 'relative' }}>
          <MapContainer center={[49.0, 31.0]} zoom={6} zoomControl={false} style={{ height: '100%', width: '100%' }}>
            <MapController center={selectedNode?.coords} />
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

            <Marker position={MAIN_HUB_COORDS} icon={createMarker('HUB', selectedNodeId === 'MAIN_HUB')} eventHandlers={{ click: () => setSelectedNodeId('MAIN_HUB') }} />

            {inTransit.map(req => {
              const positions = req.routePath || [MAIN_HUB_COORDS, req.coords];
              return (
                <React.Fragment key={`route-${req.id}`}>
                  
                  <Polyline positions={positions} pathOptions={{ color: '#2563eb', weight: 6, opacity: 0.3, lineCap: 'round', lineJoin: 'round' }} />
                  
                  <Polyline positions={positions} pathOptions={{ color: '#60a5fa', weight: 2, opacity: 1, lineCap: 'round', lineJoin: 'round' }} />
                </React.Fragment>
              );
            })}

            {requests.filter(r => r.status !== 'DELIVERED').map(req => {
              const isCritical = req.currentStock < 20 || req.status === 'DELAYED';
              const markerType = isCritical ? 'CRITICAL' : (req.status === 'IN_TRANSIT' ? 'IN_TRANSIT' : 'DEFAULT');
              return <Marker key={req.id} position={req.coords} icon={createMarker(markerType, selectedNodeId === req.id)} eventHandlers={{ click: () => setSelectedNodeId(req.id) }} />;
            })}
          </MapContainer>
        </div>
      </div>

      <div style={{ width: '400px', flexShrink: 0, borderLeft: '1px solid #27272a', backgroundColor: '#18181b', display: 'flex', flexDirection: 'column' }}>
        
        <header style={{ height: '80px', borderBottom: '1px solid #27272a', display: 'flex', alignItems: 'center', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: criticalAlerts.length > 0 ? '#ef4444' : '#22c55e', boxShadow: `0 0 10px ${criticalAlerts.length > 0 ? '#ef4444' : '#22c55e'}` }}></div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#a1a1aa', textTransform: 'uppercase' }}>System Status</div>
              <div style={{ fontSize: '1rem', fontWeight: '700', color: criticalAlerts.length > 0 ? '#ef4444' : '#22c55e' }}>
                {criticalAlerts.length > 0 ? 'Action Required' : 'Operational'}
              </div>
            </div>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {selectedNode ? (
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '4px' }}>Node Telemetry</div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: '#fff', lineHeight: '1.2' }}>{selectedNode.location}</h2>
                </div>
                <button onClick={() => setSelectedNodeId(null)} style={{ background: 'transparent', border: '1px solid #3f3f46', borderRadius: '6px', color: '#a1a1aa', cursor: 'pointer', padding: '6px 10px', fontSize: '0.8rem', fontWeight: '600' }}>✕ Close</button>
              </div>

              {selectedNode.id !== 'MAIN_HUB' ? (
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ backgroundColor: '#09090b', borderRadius: '12px', padding: '20px', border: '1px solid #27272a' }}>
                    <div style={{ fontSize: '0.75rem', color: '#a1a1aa', textTransform: 'uppercase', fontWeight: '700', marginBottom: '8px' }}>Active Request / Cargo</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff' }}>{selectedNode.items}</div>
                    <div style={{ fontSize: '0.9rem', color: '#60a5fa', fontWeight: '600', marginTop: '4px' }}>{selectedNode.quantity.toLocaleString()} units expected</div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#a1a1aa', textTransform: 'uppercase' }}>Facility Stock Level</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: '800', color: selectedNode.currentStock < 20 ? '#ef4444' : '#f4f4f5' }}>{selectedNode.currentStock}%</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#09090b', borderRadius: '4px', overflow: 'hidden', border: '1px solid #27272a' }}>
                      <div style={{ height: '100%', width: `${selectedNode.currentStock}%`, backgroundColor: selectedNode.currentStock < 20 ? '#ef4444' : '#3b82f6' }}></div>
                    </div>
                  </div>

                  {(selectedNode.status === 'DELAYED' || selectedNode.currentStock < 20) && (
                    <div className="animate-in" style={{ marginTop: '16px', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', marginBottom: '16px' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        <span style={{ fontSize: '1rem', fontWeight: '800', textTransform: 'uppercase' }}>Crisis Protocol</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#f87171', marginBottom: '20px', lineHeight: '1.4' }}>
                        {selectedNode.status === 'DELAYED' ? "Driver reported a critical issue on the route." : "Facility stock has dropped below critical levels."}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button onClick={() => showNotification('Rerouting backup fleet...', 'info')} style={{ padding: '14px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                           Reroute Nearest Backup
                        </button>
                        {selectedNode.status === 'DELAYED' && (
                          <button onClick={() => handleResolveAlert(selectedNode.id)} style={{ padding: '14px', backgroundColor: 'transparent', color: '#22c55e', border: '1px solid #22c55e', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                             Mark Issue as Resolved
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ padding: '40px 24px', color: '#a1a1aa', textAlign: 'center', lineHeight: '1.5' }}>
                  <strong>Central Distribution Hub.</strong><br/> Origin point for all fleets.
                </div>
              )}
            </div>
          ) : (
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid #27272a' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, color: '#fff' }}>Global Incidents</h2>
                <p style={{ fontSize: '0.85rem', color: '#a1a1aa', margin: '4px 0 0 0' }}>Network anomalies and active routes.</p>
              </div>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {requests.filter(r => r.status !== 'DELIVERED').sort((a,b) => (a.currentStock < 20 || a.status === 'DELAYED') ? -1 : 1).map(req => {
                  const isAlert = req.currentStock < 20 || req.status === 'DELAYED';
                  return (
                    <div 
                      key={req.id} onClick={() => setSelectedNodeId(req.id)}
                      style={{ padding: '16px', backgroundColor: isAlert ? 'rgba(239, 68, 68, 0.05)' : '#09090b', borderRadius: '12px', cursor: 'pointer', border: `1px solid ${isAlert ? 'rgba(239, 68, 68, 0.3)' : '#27272a'}` }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '1rem', fontWeight: '700', color: '#fff' }}>{req.location.split(',')[0]}</span>
                        <span style={{ fontSize: '0.65rem', fontWeight: '800', backgroundColor: isAlert ? '#ef4444' : 'transparent', color: isAlert ? '#fff' : (req.status === 'IN_TRANSIT' ? '#60a5fa' : '#a1a1aa'), padding: isAlert ? '2px 6px' : '0', borderRadius: '4px' }}>
                          {isAlert ? 'Alert' : req.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Cargo: {req.items}</div>
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
