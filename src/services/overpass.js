import { BBOX, OVERPASS_ENDPOINTS, CACHE_TTL_MS } from '../data/config.js';
import { osmToGeoJSON } from '../utils/geo.js';
import { load, save } from '../utils/storage.js';

const CACHE_KEY = 'kh-osm-cache-v1';

export function buildQuery(bbox = BBOX) {
  const b = bbox.join(',');
  return `[out:json][timeout:60];
(
  way["building"](${b});
  way["highway"](${b});
  way["leisure"~"^(park|garden|pitch|playground|sports_centre)$"](${b});
  way["landuse"~"^(grass|forest|meadow|orchard|farmland|recreation_ground)$"](${b});
  way["natural"~"^(wood|scrub|grassland)$"](${b});
  node["natural"="tree"](${b});
  node["amenity"](${b});
);
out geom;`;
}

async function fetchWithTimeout(url, body, ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { method: 'POST', body: 'data=' + encodeURIComponent(body), headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally { clearTimeout(timer); }
}

// Returns { features, fromCache, fetchedAt }. Cached locally; Overpass is NOT a production database.
export async function loadOsmData({ force = false } = {}) {
  const key = CACHE_KEY + ':' + BBOX.join(',');
  const cached = load(key, null);
  if (!force && cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) return { ...cached, fromCache: true };
  const query = buildQuery();
  let lastErr;
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const osm = await fetchWithTimeout(url, query, 70000);
      const features = osmToGeoJSON(osm);
      const out = { features, fetchedAt: Date.now() };
      save(key, out); // may fail on quota; that is fine
      return { ...out, fromCache: false };
    } catch (e) { lastErr = e; }
  }
  if (cached) return { ...cached, fromCache: true, stale: true }; // offline fallback
  throw lastErr || new Error('No Overpass endpoint available');
}
