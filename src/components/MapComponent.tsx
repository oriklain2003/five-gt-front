import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Point, AppMode } from '../types';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface MapComponentProps {
  points: Point[];
  onAddPoint: (lat: number, lng: number) => void;
  onPointDrag: (pointId: string, updates: Partial<Point>) => void;
  onPointHover: (pointId: string | null) => void;
  mode: AppMode;
  autoZoomEnabled: boolean;
  jumpToPointEnabled: boolean;
  highlightedPoint: string | null;
  mapCenter: [number, number];
  mapZoom: number;
}

// Custom marker icons for different states
const createCustomIcon = (color: string, isFirst?: boolean, isLast?: boolean, isHighlighted?: boolean) => {
  const size = isHighlighted ? 28 : 20;
  const borderWidth = isHighlighted ? 4 : 3;
  const glowEffect = isHighlighted ? `box-shadow: 0 0 20px ${color}, 0 2px 4px rgba(0,0,0,0.3);` : `box-shadow: 0 2px 4px rgba(0,0,0,0.3);`;
  
  const iconHtml = `
    <div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: ${borderWidth}px solid white;
      ${glowEffect}
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: ${isHighlighted ? 12 : 10}px;
      color: white;
      transition: all 0.3s ease;
      animation: ${isHighlighted ? 'pulse 2s infinite' : 'none'};
    ">
      ${isFirst ? 'S' : isLast ? 'E' : ''}
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Component to handle map clicks
const MapClickHandler: React.FC<{ onAddPoint: (lat: number, lng: number) => void; mode: AppMode }> = ({ 
  onAddPoint, 
  mode 
}) => {
  useMapEvents({
    click: (e) => {
      if (mode === 'training') {
        onAddPoint(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

// Draggable marker component
const DraggableMarker: React.FC<{
  point: Point;
  onDrag: (pointId: string, updates: Partial<Point>) => void;
  onHover: (pointId: string | null) => void;
  mode: AppMode;
  isFirst?: boolean;
  isLast?: boolean;
  isHighlighted?: boolean;
}> = ({ point, onDrag, onHover, mode, isFirst, isLast, isHighlighted }) => {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = {
    dragstart: () => {
      // Prevent map interactions during drag
      if (markerRef.current) {
        const map = (markerRef.current as any)._map;
        if (map) {
          map.dragging.disable();
          map.touchZoom.disable();
          map.doubleClickZoom.disable();
          map.scrollWheelZoom.disable();
          map.boxZoom.disable();
          map.keyboard.disable();
        }
      }
    },
    drag: () => {
      // Optional: Handle during drag for real-time feedback
    },
    dragend: () => {
      const marker = markerRef.current;
      if (marker && mode === 'training') {
        const { lat, lng } = marker.getLatLng();
        onDrag(point.point_id, { lat, lon: lng });
        
        // Re-enable map interactions
        const map = (marker as any)._map;
        if (map) {
          map.dragging.enable();
          map.touchZoom.enable();
          map.doubleClickZoom.enable();
          map.scrollWheelZoom.enable();
          map.boxZoom.enable();
          map.keyboard.enable();
        }
      }
    },
    mouseover: () => onHover(point.point_id),
    mouseout: () => onHover(null),
  };

  const iconColor = mode === 'testing' ? '#ff6b6b' : '#4dabf7';
  const icon = createCustomIcon(iconColor, isFirst, isLast, isHighlighted);

  return (
    <Marker
      ref={markerRef}
      position={[point.lat, point.lon]}
      icon={icon}
      draggable={mode === 'training'}
      eventHandlers={eventHandlers}
    />
  );
};

const MapComponent: React.FC<MapComponentProps> = ({
  points,
  onAddPoint,
  onPointDrag,
  onPointHover,
  mode,
  autoZoomEnabled,
  jumpToPointEnabled,
  highlightedPoint,
  mapCenter: externalMapCenter,
  mapZoom: externalMapZoom,
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>(externalMapCenter);
  const [mapZoom, setMapZoom] = useState(externalMapZoom);

  // Update internal state when external center/zoom changes (for jump to point)
  useEffect(() => {
    setMapCenter(externalMapCenter);
    setMapZoom(externalMapZoom);
  }, [externalMapCenter, externalMapZoom]);

  // Update map view when points change (only if auto-zoom is enabled)
  useEffect(() => {
    if (autoZoomEnabled && points.length > 0) {
      const lats = points.map(p => p.lat);
      const lngs = points.map(p => p.lon);
      const centerLat = (Math.max(...lats) + Math.min(...lats)) / 2;
      const centerLng = (Math.max(...lngs) + Math.min(...lngs)) / 2;
      setMapCenter([centerLat, centerLng]);
      
      // Adjust zoom based on point spread
      const latSpread = Math.max(...lats) - Math.min(...lats);
      const lngSpread = Math.max(...lngs) - Math.min(...lngs);
      const maxSpread = Math.max(latSpread, lngSpread);
      
      if (maxSpread > 0.1) setMapZoom(8);
      else if (maxSpread > 0.01) setMapZoom(10);
      else setMapZoom(12);
    }
  }, [points, autoZoomEnabled]);

  // Create polyline path from points
  const pathPositions: [number, number][] = points
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(point => [point.lat, point.lon]);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`} // Always re-render when center/zoom changes
      >
        {/* Custom tile layer to match the style from the provided image */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        


        <MapClickHandler onAddPoint={onAddPoint} mode={mode} />

        {/* Render markers */}
        {points.map((point, index) => (
          <DraggableMarker
            key={point.point_id}
            point={point}
            onDrag={onPointDrag}
            onHover={onPointHover}
            mode={mode}
            isFirst={index === 0}
            isLast={index === points.length - 1}
            isHighlighted={highlightedPoint === point.point_id}
          />
        ))}

        {/* Render path line */}
        {pathPositions.length > 1 && (
          <Polyline
            positions={pathPositions}
            pathOptions={{
              color: mode === 'testing' ? '#ff6b6b' : '#4dabf7',
              weight: 3,
              opacity: 0.8,
            }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
