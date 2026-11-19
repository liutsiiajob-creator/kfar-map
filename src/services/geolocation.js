// Thin wrapper over the browser Geolocation API. Nothing is sent or stored anywhere.
export const geoSupported = () => typeof navigator !== 'undefined' && 'geolocation' in navigator;

export function getPosition(options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }) {
  return new Promise((resolve, reject) => {
    if (!geoSupported()) return reject({ code: 0 });
    navigator.geolocation.getCurrentPosition((p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude, accuracy: p.coords.accuracy }), reject, options);
  });
}

export function watchPosition(onPos, onErr) {
  if (!geoSupported()) return () => {};
  const id = navigator.geolocation.watchPosition(
    (p) => onPos({ lat: p.coords.latitude, lon: p.coords.longitude, accuracy: p.coords.accuracy }), onErr,
    { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 });
  return () => navigator.geolocation.clearWatch(id);
}
