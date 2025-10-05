import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { CreateLocation } from "../../types/location";

// default icon settings for Leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapViewProps {
  locations: CreateLocation[];
  center?: [number, number];
  zoom?: number;
  onMapClick?: (lat: number, lng: number) => void;
  clickable?: boolean;
}

// Component to change the map view center and zoom
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
}

// Component to handle map click events
function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  
  return null;
}

export default function MapView({
  locations,
  center = [20, 0], // World view center
  zoom = 2,
  onMapClick,
  clickable = false,
}: MapViewProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ 
        height: "100%", 
        width: "100%", 
        minHeight: "400px",
        cursor: clickable ? "crosshair" : "grab"
      }}
      className="rounded-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {clickable && onMapClick && <MapClickHandler onMapClick={onMapClick} />}
      
      {locations.length > 0 && (
        <ChangeView 
          center={[locations[locations.length - 1].latitude, locations[locations.length - 1].longitude]} 
          zoom={5} 
        />
      )}

      {locations.map((location, idx) => (
        <Marker
          key={idx}
          position={[location.latitude, location.longitude]}
        />
      ))}
    </MapContainer>
  );
}
