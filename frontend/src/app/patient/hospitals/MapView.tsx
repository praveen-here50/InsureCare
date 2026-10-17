"use client";

import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { HOSPITALS } from './data';

const markerIcon = L.divIcon({
  className: 'insurecare-map-marker',
  html: '<span aria-hidden="true"></span>',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -28],
});

const userIcon = L.divIcon({
  className: 'insurecare-user-marker',
  html: '<span aria-hidden="true"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function FitBounds() {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(HOSPITALS.map((hospital) => hospital.coordinates), { padding: [28, 28] });
  }, [map]);
  return null;
}

export default function MapView() {
  return (
    <div className="relative h-[440px] overflow-hidden bg-[#e8f0ed] sm:h-[520px]">
      <MapContainer
        center={[12.9716, 77.5946]}
        zoom={12}
        scrollWheelZoom
        zoomControl
        className="insurecare-leaflet-map"
        aria-label="Interactive map showing nearby hospitals"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds />
        <Marker position={[12.9716, 77.5946]} icon={userIcon}>
          <Popup>Your demo location</Popup>
        </Marker>
        {HOSPITALS.map((hospital) => (
          <Marker key={hospital.id} position={hospital.coordinates} icon={markerIcon}>
            <Popup>
              <strong>{hospital.name}</strong>
              <br />
              {hospital.distance} · {hospital.network} · {hospital.availableBeds} beds available
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="pointer-events-none absolute left-4 top-4 z-[400] rounded-xl border border-white/80 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm">
        <p className="text-xs font-bold text-slate-900">Nearby care</p>
        <p className="mt-0.5 text-[11px] text-slate-500">Drag, zoom, and select a hospital</p>
      </div>
      <div className="pointer-events-none absolute bottom-3 left-3 z-[400] rounded-md bg-white/90 px-2 py-1 text-[10px] font-medium text-slate-600 shadow-sm">Demo locations · OpenStreetMap</div>
    </div>
  );
}
