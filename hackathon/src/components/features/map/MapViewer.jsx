import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 8, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

const MapViewer = ({ requests, autoCenter = true }) => {
  const centerCoords = requests.length > 0 && requests[0].coords ? requests[0].coords : [48.3794, 31.1656];

  const getMarkerColor = (req) => {
    if (req.status === 'IN_TRANSIT') return '#3b82f6';
    if (req.currentStock < 20) return '#ef4444';
    return '#f59e0b';
  };

  return (
    <MapContainer center={centerCoords} zoom={6} scrollWheelZoom={true} style={{ height: '100%', width: '100%', borderRadius: 'inherit', background: 'var(--bg-dark)' }}>
      {autoCenter && <MapController center={centerCoords} />}

      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

      {requests.map((req) => (
        <CircleMarker
          key={req.id} center={req.coords || [49.8397, 24.0297]}
          pathOptions={{ color: getMarkerColor(req), fillColor: getMarkerColor(req), fillOpacity: req.status === 'IN_TRANSIT' ? 1 : 0.6, weight: 2 }}
          radius={req.status === 'IN_TRANSIT' ? 12 : (req.currentStock < 20 ? 16 : 8)}
        >
          <Tooltip permanent={req.currentStock < 20 || req.status === 'IN_TRANSIT'} direction="top" offset={[0, -10]}>
            <span style={{ fontWeight: '700', color: '#09090b' }}>
              {req.location} {req.status === 'IN_TRANSIT' ? '🚚' : ''}
            </span>
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
};

export default MapViewer;