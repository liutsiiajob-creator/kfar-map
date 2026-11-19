import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Circle, Polyline, Polygon, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { APPROX_CENTER, APPROX_ZOOM, TILE_URL, TILE_ATTRIBUTION, CATEGORIES } from '../../data/config.js';

function Controller({ flyTo, fitTo }) {
  const map = useMap();
  useEffect(() => { if (flyTo) map.flyTo([flyTo.lat, flyTo.lon], Math.max(map.getZoom(), 18)); }, [flyTo, map]);
  useEffect(() => { if (fitTo) map.fitBounds(fitTo, { padding: [30, 30] }); }, [fitTo, map]);
  return null;
}

function DrawClicks({ active, onPoint }) {
  useMapEvents({ click: (e) => active && onPoint([e.latlng.lat, e.latlng.lng]) });
  return null;
}

function hashKey(list, sel) {
  let h = 0;
  const s = list.map((f) => f.id).join('|') + '#' + sel;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return 'b' + list.length + ':' + h;
}

const ctxStyle = (f) => {
  const t = (f.properties && f.properties.tags) || {};
  if (f.geometry.type === 'LineString') {
    const foot = ['footway', 'path', 'pedestrian', 'steps', 'track', 'cycleway'].includes(t.highway);
    return foot ? { color: '#b5651d', weight: 2, dashArray: '4 4' } : { color: '#777', weight: 4 };
  }
  return { color: '#5a9a4a', weight: 1, fillColor: '#8fcf7a', fillOpacity: 0.35 };
};

export default function MapView({ buildings, context, selectedId, onSelect, userPos, flyTo, fitTo, drawing, draftPoints, onAddPoint }) {
  const ctxLines = useMemo(() => context.filter((f) => f.geometry.type !== 'Point'), [context]);
  const trees = useMemo(() => context.filter((f) => f.geometry.type === 'Point' && f.properties.tags && f.properties.tags.natural === 'tree'), [context]);

  return (
    <MapContainer center={APPROX_CENTER} zoom={APPROX_ZOOM} maxZoom={20} zoomControl className="map">
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxNativeZoom={19} maxZoom={20} />
      <Controller flyTo={flyTo} fitTo={fitTo} />
      <DrawClicks active={drawing} onPoint={onAddPoint} />

      <GeoJSON key={'ctx' + ctxLines.length} data={{ type: 'FeatureCollection', features: ctxLines }} style={ctxStyle} interactive={false} />
      {trees.map((f) => (
        <CircleMarker key={f.id} center={[f.geometry.coordinates[1], f.geometry.coordinates[0]]} radius={2} pathOptions={{ color: '#2e7d32', weight: 1 }} interactive={false} />
      ))}

      <GeoJSON
        key={hashKey(buildings, selectedId)}
        data={{ type: 'FeatureCollection', features: buildings }}
        style={(f) => ({ color: f.id === selectedId ? '#000' : '#333', weight: f.id === selectedId ? 3 : 1, fillColor: CATEGORIES[f.properties.category].color, fillOpacity: 0.7 })}
        onEachFeature={(f, layer) => layer.on('click', (e) => { if (!drawing) { L.DomEvent.stopPropagation(e); onSelect(f.id); } })}
      />

      {draftPoints.length > 0 && <Polyline positions={draftPoints} pathOptions={{ color: '#e8202a', dashArray: '6 4' }} />}
      {draftPoints.length > 2 && <Polygon positions={draftPoints} pathOptions={{ color: '#e8202a', fillOpacity: 0.2 }} />}
      {draftPoints.map((p, i) => <CircleMarker key={i} center={p} radius={4} pathOptions={{ color: '#e8202a' }} />)}

      {userPos && (
        <>
          <Circle center={[userPos.lat, userPos.lon]} radius={userPos.accuracy || 20} pathOptions={{ color: '#1a73e8', weight: 1, fillOpacity: 0.12 }} interactive={false} />
          <CircleMarker center={[userPos.lat, userPos.lon]} radius={8} pathOptions={{ color: '#fff', weight: 3, fillColor: '#1a73e8', fillOpacity: 1 }} interactive={false} />
        </>
      )}
    </MapContainer>
  );
}
