'use client';

import { useEffect, useRef } from 'react';

interface MapSelectorProps {
  onLocationSelect: (lat: number, lng: number) => void;
  defaultCenter?: { lat: number; lng: number };
  zoom?: number;
}

const DEFAULT_CENTER = { lat: 6.5244, lng: 3.3792 }; // Lagos, Nigeria

export default function MapSelector({
  onLocationSelect,
  defaultCenter = DEFAULT_CENTER,
  zoom = 12,
}: MapSelectorProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    const initMap = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom,
    });

    const clickListener = initMap.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        onLocationSelect(lat, lng);
      }
    });

    // Cleanup on unmount
    return () => {
      window.google.maps.event.clearInstanceListeners(initMap);
    };
  }, [defaultCenter, zoom, onLocationSelect]);

  return (
    <div
      ref={mapRef}
      style={{ height: '400px', width: '100%', borderRadius: '0.5rem' }}
      className="shadow"
    />
  );
}