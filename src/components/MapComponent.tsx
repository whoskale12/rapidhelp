/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location } from '../services/geolocationService';

interface MapComponentProps {
  userLocation: Location | null;
  helperLocation: Location | null;
  onMapReady?: () => void;
}

// Fix for Leaflet default icons
const DefaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const UserIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'user-marker',
});

const HelperIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDEiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCA0MSA0MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMC41IiBjeT0iMjAuNSIgcj0iMTgiIGZpbGw9IiNiNzEzMWEiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==',
  iconRetinaUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDEiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCA0MSA0MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMC41IiBjeT0iMjAuNSIgcj0iMTgiIGZpbGw9IiNiNzEzMWEiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==',
  iconSize: [41, 41],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

L.Marker.prototype.options.icon = DefaultIcon;

export const MapComponent: React.FC<MapComponentProps> = ({
  userLocation,
  helperLocation,
  onMapReady,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const userMarker = useRef<L.Marker | null>(null);
  const helperMarker = useRef<L.Marker | null>(null);
  const routeLine = useRef<L.Polyline | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    // Create map centered on a default location (Jakarta)
    map.current = L.map(mapContainer.current).setView([-6.2088, 106.8456], 13);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    onMapReady?.();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [onMapReady]);

  // Update user marker
  useEffect(() => {
    if (!map.current || !userLocation) return;

    const lat = userLocation.latitude;
    const lon = userLocation.longitude;

    if (userMarker.current) {
      userMarker.current.setLatLng([lat, lon]);
    } else {
      userMarker.current = L.marker([lat, lon], { icon: UserIcon })
        .bindPopup('Your Location')
        .addTo(map.current);
    }

    // Fit map to show both markers or just user
    if (helperMarker.current) {
      const group = new L.FeatureGroup([userMarker.current, helperMarker.current]);
      map.current.fitBounds(group.getBounds(), { padding: [50, 50] });
    } else {
      map.current.setView([lat, lon], map.current.getZoom());
    }
  }, [userLocation]);

  // Update helper marker
  useEffect(() => {
    if (!map.current || !helperLocation) return;

    const lat = helperLocation.latitude;
    const lon = helperLocation.longitude;

    if (helperMarker.current) {
      helperMarker.current.setLatLng([lat, lon]);
    } else {
      helperMarker.current = L.marker([lat, lon], { icon: HelperIcon })
        .bindPopup('Emergency Helper')
        .addTo(map.current);
    }

    // Fit map to show both markers
    if (userMarker.current && map.current) {
      const group = new L.FeatureGroup([userMarker.current, helperMarker.current]);
      map.current.fitBounds(group.getBounds(), { padding: [50, 50] });

      // Draw route line
      if (routeLine.current) {
        map.current.removeLayer(routeLine.current);
      }
      routeLine.current = L.polyline(
        [
          [userMarker.current.getLatLng().lat, userMarker.current.getLatLng().lng],
          [lat, lon],
        ],
        { color: '#b7131a', weight: 3, opacity: 0.7, dashArray: '5, 5' }
      ).addTo(map.current);
    }
  }, [helperLocation]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full rounded-lg overflow-hidden shadow-md"
      style={{ minHeight: '400px' }}
    />
  );
};