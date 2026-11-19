// All geography lives here. NOTHING below is verified yet:
// run `npm run probe` (Stage 0) to read the real boundaries/building coverage from OpenStreetMap,
// then paste the result into BBOX. Until then the map starts at an approximate centre
// and fits itself to the data once it is downloaded.
export const APPROX_CENTER = [32.745, 35.104]; // [lat, lon] approximate - to be verified
export const APPROX_ZOOM = 16;

// [south, west, north, east]. Set to the bbox printed by `npm run probe`.
export const BBOX = [32.738, 35.094, 32.752, 35.114]; // PROVISIONAL - adjust after probe

export const OVERPASS_ENDPOINTS = [
  import.meta.env.VITE_OVERPASS_URL,
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
].filter(Boolean);

export const TILE_URL = import.meta.env.VITE_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const CACHE_TTL_MS = 7 * 24 * 3600 * 1000;

export const CATEGORIES = {
  residential: { color: '#f5a623' },
  educational: { color: '#4da3ff' },
  administrative: { color: '#7b61ff' },
  public: { color: '#37d67a' },
  agricultural: { color: '#a0782c' },
  other: { color: '#8a8a8a' },
};
