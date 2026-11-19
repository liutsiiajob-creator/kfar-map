import { useEffect, useRef, useState } from 'react';
import { getPosition, watchPosition } from '../../services/geolocation.js';

// Requests the position ONCE on mount, then (optionally) watches it. Cleans up on unmount.
export function useLocation({ watch = true } = {}) {
  const [pos, setPos] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | pending | ok | denied | unavailable
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return; // guards against StrictMode double-run / re-renders
    started.current = true;
    let stop = () => {};
    let alive = true;
    setStatus('pending');
    getPosition().then((p) => {
      if (!alive) return;
      setPos(p); setStatus('ok');
      if (watch) stop = watchPosition((q) => alive && setPos(q), () => {});
    }).catch((e) => alive && setStatus(e && e.code === 1 ? 'denied' : 'unavailable'));
    return () => { alive = false; stop(); };
  }, [watch]);

  return { pos, status };
}
