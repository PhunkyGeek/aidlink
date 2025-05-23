// ✅ components/MapSelector.tsx
'use client';

import { useState, useEffect, useRef } from 'react';

interface MapSelectorProps {
  onLocationSelect: (lat: number, lng: number) => void;
  defaultCenter?: { lat: number; lng: number };
  zoom?: number;
}

const DEFAULT_CENTER = { lat: 6.5244, lng: 3.3792 }; // Lagos, Nigeria

export default function MapSelector({ onLocationSelect, defaultCenter = DEFAULT_CENTER, zoom = 12 }: MapSelectorProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    const initMap = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom,
    });

    initMap.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        onLocationSelect(lat, lng);
      }
    });

    setMap(initMap);
  }, [defaultCenter, zoom, onLocationSelect]);

  return (
    <div ref={mapRef} style={{ height: '400px', width: '100%', borderRadius: '0.5rem' }} className="shadow" />
  );
}
