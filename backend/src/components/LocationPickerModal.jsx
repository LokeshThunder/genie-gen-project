import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon issue with webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

const LocationPickerModal = ({ isOpen, onClose, onSave, initialLocation }) => {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setPosition(initialLocation || { lat: 20.5937, lng: 78.9629 }); // Default to India center
    }
  }, [isOpen, initialLocation]);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ backgroundColor: 'var(--bg-card, white)', padding: 20, borderRadius: 12, width: '90%', maxWidth: 500, color: 'var(--text-primary)' }} onClick={e => e.stopPropagation()}>
        <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 18, fontWeight: 700 }}>Pin Location on Map</h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary, #6B6B6B)', marginBottom: 16 }}>Tap anywhere on the map to place the exact work location pin.</p>
        
        <div style={{ height: 300, width: '100%', borderRadius: 12, overflow: 'hidden', marginBottom: 20, border: '1px solid var(--border)' }}>
          <MapContainer center={position || { lat: 20.5937, lng: 78.9629 }} zoom={initialLocation ? 14 : 4} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} setPosition={setPosition} />
          </MapContainer>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button 
            onClick={onClose} 
            className="cred-btn-white"
            style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-primary)', fontWeight: 600 }}>
            Cancel
          </button>
          <button 
            onClick={() => {
              if (position) onSave({ lat: position.lat, lng: position.lng });
              onClose();
            }} 
            disabled={!position}
            className="cred-btn-black"
            style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: position ? '#0D0D0D' : '#ccc', color: '#fff', fontWeight: 700 }}>
            Save Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerModal;
