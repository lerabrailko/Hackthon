import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGlobalContext } from '../context/GlobalStore';
import { useNotify } from '../context/NotificationContext';
import { useLang } from '../context/LanguageContext'; // Підключили контекст мови та теми
import { calculatePriorityScore } from '../utils/priority';
import ClientDashboard from '../components/features/dashboard/ClientDashboard';
import DriverDashboard from '../components/features/dashboard/DriverDashboard';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const TRUCK_CAPACITY = 20000; 
const MAIN_HUB_COORDS = [50.4501, 30.5234]; // Київ

const SVGs = {
  package: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  minus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  truck: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3f3f46" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
};

const hubIcon = new L.DivIcon({
  className: 'clear-marker',
  html: `<div class="hub-marker-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M3 21h18"></path><path d="M5 21V7l8-4v18"></path><path d="M19 21V11l-6-3"></path><path d="M9 9v2"></path><path d="M9 13v2"></path></svg></div>`,
  iconSize: [24, 24], iconAnchor: [12, 12]
});

const destIcon = new L.DivIcon({
  className: 'clear-marker',
  html: `<div class="dest-marker-icon"></div>`,
  iconSize: [14, 14], iconAnchor: [7, 7]
});

const MapBounds = ({ requests }) => {
  const map = useMap();
  useEffect(() => {
    if (requests.length > 0) {
      const bounds = L.latLngBounds([MAIN_HUB_COORDS]);
      requests.forEach(req => {
        if (req.routePath) req.routePath.forEach(pt => bounds.extend(pt));
        else if (req.coords) bounds.extend(req.coords);
      });
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 8, animate: true, duration: 1 });
    } else {
      map.flyTo(MAIN_HUB_COORDS, 6, { animate: true, duration: 1 });
    }
  }, [requests, map]);
  return null;
};

const AdminDashboard = () => {
  const { requests, updateRequestStatus } = useGlobalContext();
  const { showNotification } = useNotify();
  const { t, theme } = useLang(); // Дістаємо переклад і тему
  
  const [filterCategory, setFilterCategory] = useState('All');
  const [selectedForFleet, setSelectedForFleet] = useState([]);

  let pendingQueue = requests.filter(r => (r.status === 'PENDING' || r.status === 'DRAFT') && !selectedForFleet.find(s => s.id === r.id));
  if (filterCategory !== 'All') pendingQueue = pendingQueue.filter(r => r.items.includes(filterCategory));
  pendingQueue.sort((a, b) => calculatePriorityScore(b) - calculatePriorityScore(a));

  const allCategories = ['All', 'Medicine', 'Food', 'Water', 'Equipment', 'Fuel'];
  const currentPayload = selectedForFleet.reduce((sum, req) => sum + req.quantity, 0);
  const fillPercentage = Math.min((currentPayload / TRUCK_CAPACITY) * 100, 100);
  const isOverloaded = currentPayload > TRUCK_CAPACITY;

  const handleAdd = (req) => setSelectedForFleet([...selectedForFleet, req]);
  const handleRemove = (reqId) => setSelectedForFleet(selectedForFleet.filter(item => item.id !== reqId));

  const handleDispatchFleet = () => {
    if (selectedForFleet.length === 0 || isOverloaded) return;
    selectedForFleet.forEach(req => updateRequestStatus(req.id, 'IN_TRANSIT'));
    showNotification(`Fleet dispatched! ${selectedForFleet.length} orders en route.`, 'success');
    setSelectedForFleet([]); 
  };

  // Динамічний URL карти залежно від теми
  const tileUrl = theme === 'light' 
    ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

  return (
    <div className="admin-dashboard-layout">
      
      {/* ЛІВА ПАНЕЛЬ */}
      <div className="queue-panel">
        <div className="queue-header">
          <h2 className="queue-title">{t('available_orders') || 'Available Orders'}</h2>
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)} 
            className="settings-select w-full"
          >
            {allCategories.map(cat => <option key={cat} value={cat}>{t(cat)}</option>)}
          </select>
        </div>
        
        <div className="queue-list">
          {pendingQueue.map((req) => {
            const score = calculatePriorityScore(req);
            const isHighScore = score > 80;
            return (
              <div key={req.id} className="queue-item">
                <div className="queue-item-header">
                  <span className="queue-item-location">{req.location.split(',')[0]}</span>
                  <span className={`queue-item-score ${isHighScore ? 'score-high' : 'score-normal'}`}>
                    SCORE: {score}
                  </span>
                </div>
                <div className="queue-item-body">
                  {SVGs.package} <strong>{req.quantity.toLocaleString()}</strong> {t('units')} {t('of')} {t(req.items)}
                </div>
                <button onClick={() => handleAdd(req)} className="btn-add-truck">
                  {SVGs.plus} {t('add_to_truck') || 'Add to Truck'}
                </button>
              </div>
            );
          })}
          {pendingQueue.length === 0 && <div className="queue-empty">{t('no_orders') || 'No orders available.'}</div>}
        </div>
      </div>

      {/* ПРАВА ПАНЕЛЬ */}
      <div className="manifest-panel">
        <div className="manifest-header">
          <h2 className="manifest-title">{t('truck_manifest') || 'Truck Manifest (AI-1020)'}</h2>
          <p className="manifest-subtitle">{t('review_route') || 'Review route and capacity'}</p>
        </div>

        {selectedForFleet.length === 0 ? (
          <div className="manifest-empty-state">
            {SVGs.truck}
            <h3>{t('truck_empty') || 'The truck is empty'}</h3>
            <p>{t('add_orders_msg') || 'Add orders from the queue to start routing.'}</p>
          </div>
        ) : (
          <div className="manifest-content animate-in">
            
            <div className={`payload-card ${isOverloaded ? 'overloaded' : ''}`}>
              <div className="payload-header">
                <span className="payload-label">{t('payload_capacity') || 'PAYLOAD CAPACITY'}</span>
                <span className={`payload-values ${isOverloaded ? 'text-danger' : 'text-normal'}`}>
                  {currentPayload.toLocaleString()} / {TRUCK_CAPACITY.toLocaleString()}
                </span>
              </div>
              <div className="payload-bar-bg">
                <div 
                  className={`payload-bar-fill ${isOverloaded ? 'fill-danger' : 'fill-primary'}`} 
                  style={{ width: `${fillPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="manifest-split-view">
              <div className="route-stops-list">
                <h3 className="route-stops-title">{t('route_stops') || 'Route Stops'}</h3>
                {selectedForFleet.map((req, index) => (
                  <div key={req.id} className="stop-item">
                    <div className="stop-item-info">
                      <div className="stop-index">{index + 1}</div>
                      <div>
                        <div className="stop-location">{req.location.split(',')[0]}</div>
                        <div className="stop-details">{req.quantity.toLocaleString()}x {t(req.items)}</div>
                      </div>
                    </div>
                    <button onClick={() => handleRemove(req.id)} className="btn-remove">
                      {t('remove') || 'Remove'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="map-container-wrapper">
                <MapContainer center={MAIN_HUB_COORDS} zoom={6} zoomControl={false} className="full-map">
                  <MapBounds requests={selectedForFleet} />
                  <TileLayer key={theme} url={tileUrl} />
                  <Marker position={MAIN_HUB_COORDS} icon={hubIcon} />
                  
                  {selectedForFleet.map(req => {
                    const positions = req.routePath || [MAIN_HUB_COORDS, req.coords || [49.0, 31.0]];
                    return (
                      <React.Fragment key={`route-${req.id}`}>
                        <Polyline positions={positions} pathOptions={{ color: '#3b82f6', weight: 3, opacity: 0.8 }} />
                        <Marker position={req.coords || [49.0, 31.0]} icon={destIcon} />
                      </React.Fragment>
                    );
                  })}
                </MapContainer>
              </div>
            </div>

            <button 
              onClick={handleDispatchFleet} 
              disabled={isOverloaded}
              className={`btn-dispatch ${isOverloaded ? 'disabled' : ''}`}
            >
              {isOverloaded ? (t('cannot_dispatch') || 'Cannot Dispatch (Overloaded)') : (t('confirm_dispatch') || 'Confirm & Dispatch Fleet')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  if (user?.role === 'CUSTOMER') return <ClientDashboard />;
  if (user?.role === 'DRIVER') return <DriverDashboard />;
  return <AdminDashboard />;
};

export default DashboardPage;