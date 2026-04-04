import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGlobalContext } from '../context/GlobalStore';
import { useNotify } from '../context/NotificationContext';
import { calculatePriorityScore } from '../utils/priority';
import ClientDashboard from '../components/features/dashboard/ClientDashboard';
import DriverDashboard from '../components/features/dashboard/DriverDashboard';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const TRUCK_CAPACITY = 20000; 
const MAIN_HUB_COORDS = [50.4501, 30.5234];

const SVGs = {
  package: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  truck: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3f3f46" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
};

const hubIcon = new L.DivIcon({
  className: 'clear-marker',
  html: `<div style="background: #18181b; border: 2px solid #3b82f6; width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(59,130,246,0.6);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M3 21h18"></path><path d="M5 21V7l8-4v18"></path><path d="M19 21V11l-6-3"></path><path d="M9 9v2"></path><path d="M9 13v2"></path></svg></div>`,
  iconSize: [24, 24], iconAnchor: [12, 12]
});

const destIcon = new L.DivIcon({
  className: 'clear-marker',
  html: `<div style="background: #18181b; border: 2px solid #a1a1aa; width: 14px; height: 14px; border-radius: 50%; display: flex; align-items: center; justify-content: center;"></div>`,
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

  return (
    <div style={{ display: 'flex', height: '100%', backgroundColor: '#09090b', color: '#f4f4f5' }}>
      
      <div style={{ width: '400px', flexShrink: 0, borderRight: '1px solid #27272a', display: 'flex', flexDirection: 'column', backgroundColor: '#09090b' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #27272a' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', margin: '0 0 12px 0' }}>Available Orders</h2>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ padding: '10px 12px', borderRadius: '6px', backgroundColor: '#18181b', color: '#f4f4f5', border: '1px solid #3f3f46', width: '100%', outline: 'none' }}>
            {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {pendingQueue.map((req) => {
            const score = calculatePriorityScore(req);
            return (
              <div key={req.id} style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '10px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontWeight: '700', fontSize: '1rem', color: '#fff' }}>{req.location.split(',')[0]}</span>
                  <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700', backgroundColor: score > 80 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)', color: score > 80 ? '#ef4444' : '#a1a1aa' }}>
                    SCORE: {score}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '16px' }}>
                  {SVGs.package} <strong style={{color: '#d4d4d8'}}>{req.quantity.toLocaleString()}</strong> units of {req.items}
                </div>
                <button onClick={() => handleAdd(req)} style={{ width: '100%', padding: '10px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
                  {SVGs.plus} Add to Truck
                </button>
              </div>
            );
          })}
          {pendingQueue.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#71717a' }}>No orders available.</div>}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #27272a', backgroundColor: '#09090b' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', margin: '0 0 4px 0' }}>Truck Manifest (AI-1020)</h2>
          <p style={{ color: '#a1a1aa', fontSize: '0.85rem', margin: 0 }}>Review route and capacity</p>
        </div>

        {selectedForFleet.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#71717a' }}>
            {SVGs.truck}
            <h3 style={{ color: '#e4e4e7', fontSize: '1.1rem', margin: '16px 0 8px 0' }}>The truck is empty</h3>
            <p style={{ fontSize: '0.9rem' }}>Add orders from the queue to start routing.</p>
          </div>
        ) : (
          <div className="animate-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', overflowY: 'hidden' }}>
            
            <div style={{ backgroundColor: '#18181b', border: `1px solid ${isOverloaded ? '#ef4444' : '#27272a'}`, borderRadius: '12px', padding: '20px', marginBottom: '24px', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#a1a1aa' }}>PAYLOAD CAPACITY</span>
                <span style={{ fontSize: '1rem', fontWeight: '700', color: isOverloaded ? '#ef4444' : '#f4f4f5' }}>{currentPayload.toLocaleString()} / {TRUCK_CAPACITY.toLocaleString()}</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#27272a', borderRadius: '4px' }}>
                <div style={{ width: `${fillPercentage}%`, height: '100%', backgroundColor: isOverloaded ? '#ef4444' : '#3b82f6', borderRadius: '4px', transition: '0.3s' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '24px', flex: 1, minHeight: 0, marginBottom: '24px' }}>
              <div style={{ width: '350px', flexShrink: 0, overflowY: 'auto', paddingRight: '8px' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#71717a', textTransform: 'uppercase', marginBottom: '12px' }}>Route Stops</h3>
                {selectedForFleet.map((req, index) => (
                  <div key={req.id} style={{ padding: '16px', backgroundColor: '#18181b', borderRadius: '8px', border: '1px solid #27272a', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#27272a', color: '#a1a1aa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '800' }}>{index + 1}</div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>{req.location.split(',')[0]}</div>
                        <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '4px' }}>{req.quantity.toLocaleString()}x {req.items}</div>
                      </div>
                    </div>
                    <button onClick={() => handleRemove(req.id)} style={{ width: '100%', padding: '8px', background: 'transparent', border: '1px solid #3f3f46', color: '#a1a1aa', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}>Remove</button>
                  </div>
                ))}
              </div>

              <div style={{ flex: 1, backgroundColor: '#09090b', borderRadius: '12px', border: '1px solid #27272a', overflow: 'hidden', position: 'relative' }}>
                <MapContainer center={MAIN_HUB_COORDS} zoom={6} zoomControl={false} style={{ height: '100%', width: '100%', background: '#09090b', borderRadius: '0' }}>
                  <MapBounds requests={selectedForFleet} />
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                  <Marker position={MAIN_HUB_COORDS} icon={hubIcon} />
                  
                  {selectedForFleet.map(req => {
                    const positions = req.routePath || [MAIN_HUB_COORDS, req.coords || [49.0, 31.0]];
                    return (
                      <React.Fragment key={`route-${req.id}`}>
                        <Polyline positions={positions} pathOptions={{ color: '#2563eb', weight: 6, opacity: 0.3, lineCap: 'round', lineJoin: 'round' }} />
                        <Polyline positions={positions} pathOptions={{ color: '#60a5fa', weight: 2, opacity: 1, lineCap: 'round', lineJoin: 'round' }} />
                        <Marker position={req.coords || [49.0, 31.0]} icon={destIcon} />
                      </React.Fragment>
                    );
                  })}
                </MapContainer>
              </div>
            </div>

            <button 
              onClick={handleDispatchFleet} disabled={isOverloaded}
              style={{ width: '100%', padding: '20px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '800', border: 'none', backgroundColor: isOverloaded ? '#27272a' : '#2563eb', color: isOverloaded ? '#71717a' : '#ffffff', cursor: isOverloaded ? 'not-allowed' : 'pointer', flexShrink: 0 }}
            >
              {isOverloaded ? 'Cannot Dispatch (Overloaded)' : 'Confirm & Dispatch Fleet'}
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