// Minimal OSM-JSON (out geom) -> GeoJSON converter. Relations (multipolygons) are skipped on purpose:
// we never invent geometry. Buildings that exist only as relations simply do not appear (add manually).
const isClosed = (c) => c.length > 3 && c[0][0] === c[c.length - 1][0] && c[0][1] === c[c.length - 1][1];

export function osmToGeoJSON(osm) {
  const features = [];
  for (const el of osm.elements || []) {
    const tags = el.tags || {};
    if (el.type === 'node' && typeof el.lat === 'number') {
      features.push({ type: 'Feature', id: `node/${el.id}`, properties: { osmId: `node/${el.id}`, tags }, geometry: { type: 'Point', coordinates: [el.lon, el.lat] } });
    } else if (el.type === 'way' && Array.isArray(el.geometry) && el.geometry.length > 1) {
      const coords = el.geometry.map((p) => [p.lon, p.lat]);
      const area = isClosed(coords) && (tags.building || tags.leisure || tags.landuse || tags.natural || tags.amenity) && tags.area !== 'no';
      features.push({
        type: 'Feature', id: `way/${el.id}`, properties: { osmId: `way/${el.id}`, tags },
        geometry: area ? { type: 'Polygon', coordinates: [coords] } : { type: 'LineString', coordinates: coords },
      });
    }
  }
  return features;
}

export function centroid(geometry) {
  const ring = geometry.type === 'Polygon' ? geometry.coordinates[0] : geometry.type === 'Point' ? [geometry.coordinates] : geometry.coordinates;
  const n = ring.length - (geometry.type === 'Polygon' ? 1 : 0) || 1;
  let x = 0, y = 0;
  for (let i = 0; i < n; i++) { x += ring[i][0]; y += ring[i][1]; }
  return { lon: x / n, lat: y / n };
}
