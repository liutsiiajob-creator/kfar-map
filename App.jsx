import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import MapView from './components/Map/MapView.jsx';
import SearchBar from './components/Search/SearchBar.jsx';
import CategoryFilters from './components/Filters/CategoryFilters.jsx';
import BuildingPanel from './components/Building/BuildingPanel.jsx';
import LocateButton from './components/Location/LocateButton.jsx';
import { useLocation } from './components/Location/useLocation.js';
import { loadOsmData } from './services/overpass.js';
import { categoryFromTags } from './utils/category.js';
import { centroid } from './utils/geo.js';
import { load, save } from './utils/storage.js';
import { CATEGORIES } from './data/config.js';
import { LANGS, makeT } from './data/i18n.js';

const isBuilding = (f) => f.properties.tags && f.properties.tags.building && f.geometry.type === 'Polygon';

export default function App() {
  const [lang, setLang] = useState(() => load('kh-lang', 'he'));
  const t = useMemo(() => makeT(lang), [lang]);
  useEffect(() => { document.documentElement.lang = lang; document.documentElement.dir = LANGS[lang].dir; save('kh-lang', lang); }, [lang]);

  const [osm, setOsm] = useState({ status: 'loading', features: [], error: null });
  const [manual, setManual] = useState(() => load('kh-manual', []));
  const [edits, setEdits] = useState(() => load('kh-edits', {}));
  useEffect(() => { save('kh-manual', manual); }, [manual]);
  useEffect(() => { save('kh-edits', edits); }, [edits]);

  const [active, setActive] = useState(() => new Set(Object.keys(CATEGORIES)));
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [flyTo, setFlyTo] = useState(null);
  const [fitTo, setFitTo] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [draft, setDraft] = useState([]);
  const [notice, setNotice] = useState('');
  const fileRef = useRef(null);

  const fetchData = useCallback((force = false) => {
    setOsm((o) => ({ ...o, status: 'loading', error: null }));
    loadOsmData({ force }).then(
      (r) => {
        setOsm({ status: 'ok', features: r.features, error: null, fromCache: r.fromCache });
        const pts = r.features.filter(isBuilding).flatMap((f) => f.geometry.coordinates[0].map((c) => [c[1], c[0]]));
        if (pts.length) setFitTo(L.latLngBounds(pts));
      },
      (e) => setOsm({ status: 'error', features: [], error: String(e.message || e) }),
    );
  }, []);
  useEffect(() => { fetchData(false); }, [fetchData]);

  // Geolocation: asked once on startup; centre on the user only if they are near the data (first visit).
  const { pos, status: locStatus } = useLocation({ watch: true });
  const centred = useRef(false);
  useEffect(() => {
    if (pos && !centred.current) { centred.current = true; setFlyTo({ lat: pos.lat, lon: pos.lon, k: Date.now() }); }
  }, [pos]);
  useEffect(() => {
    if (locStatus === 'denied') setNotice(t('locDenied'));
    else if (locStatus === 'unavailable') setNotice(t('locUnavailable'));
    else setNotice('');
  }, [locStatus, t]);

  // Merge OSM buildings + local edits + manual buildings. Unknown fields stay empty (never invented).
  const buildings = useMemo(() => {
    const fromOsm = osm.features.filter(isBuilding).map((f) => {
      const e = edits[f.id] || {};
      const tags = f.properties.tags;
      return {
        type: 'Feature', id: f.id, geometry: f.geometry,
        properties: { id: f.id, source: 'osm', name: tags.name || '', number: '', category: categoryFromTags(tags), description: '', notes: '', photo: '', ...e },
      };
    });
    return [...fromOsm, ...manual];
  }, [osm.features, edits, manual]);

  const context = useMemo(() => osm.features.filter((f) => !isBuilding(f) && !(f.properties.tags && f.properties.tags.building)), [osm.features]);

  const q = query.trim().toLowerCase();
  const matches = useMemo(() => !q ? buildings : buildings.filter((f) => {
    const p = f.properties;
    return [p.name, p.number, p.category, t('cat_' + p.category)].some((v) => v && String(v).toLowerCase().includes(q));
  }), [buildings, q, t]);
  const visible = useMemo(() => matches.filter((f) => active.has(f.properties.category)), [matches, active]);

  const selected = buildings.find((f) => f.id === selectedId) || null;
  const pick = (id) => {
    setSelectedId(id);
    const f = buildings.find((b) => b.id === id);
    if (f) setFlyTo({ ...centroid(f.geometry), k: Date.now() });
  };

  const saveProps = (id, props) => {
    if (id.startsWith('manual/')) setManual((m) => m.map((f) => (f.id === id ? { ...f, properties: { ...f.properties, ...props } } : f)));
    else setEdits((e) => ({ ...e, [id]: { name: props.name, number: props.number, category: props.category, description: props.description, notes: props.notes, photo: props.photo } }));
  };
  const del = (id) => { setManual((m) => m.filter((f) => f.id !== id)); setSelectedId(null); };

  const finishDraw = () => {
    if (draft.length >= 3) {
      const ring = draft.map((p) => [p[1], p[0]]); ring.push(ring[0]);
      const id = 'manual/' + Date.now().toString(36);
      setManual((m) => [...m, { type: 'Feature', id, geometry: { type: 'Polygon', coordinates: [ring] },
        properties: { id, source: 'manual', name: '', number: '', category: 'other', description: '', notes: '', photo: '' } }]);
      setSelectedId(id);
    }
    setDraft([]); setDrawing(false);
  };

  const exportGeo = () => {
    const blob = new Blob([JSON.stringify({ type: 'FeatureCollection', features: buildings }, null, 2)], { type: 'application/geo+json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'kfar-hasidim-buildings.geojson'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const importGeo = async (file) => {
    try {
      const gj = JSON.parse(await file.text());
      const feats = (gj.features || []).filter((f) => f.geometry && f.geometry.type === 'Polygon');
      const added = feats.map((f, i) => {
        const id = 'manual/' + Date.now().toString(36) + i;
        const p = f.properties || {};
        return { type: 'Feature', id, geometry: f.geometry, properties: { name: '', number: '', category: 'other', description: '', notes: '', photo: '', ...p, id, source: 'manual', category: CATEGORIES[p.category] ? p.category : 'other' } };
      });
      setManual((m) => [...m, ...added]);
    } catch { setNotice('GeoJSON ✕'); }
  };

  const coords = selected ? centroid(selected.geometry) : null;

  return (
    <div className="app">
      <header className="top">
        <h1>{t('title')}</h1>
        <select value={lang} onChange={(e) => setLang(e.target.value)} aria-label="language">
          {Object.keys(LANGS).map((k) => <option key={k} value={k}>{LANGS[k].name}</option>)}
        </select>
      </header>

      <MapView buildings={visible} context={context} selectedId={selectedId} onSelect={setSelectedId} userPos={pos}
        flyTo={flyTo} fitTo={fitTo} drawing={drawing} draftPoints={draft} onAddPoint={(p) => setDraft((d) => [...d, p])} />

      <div className="overlay">
        <SearchBar t={t} value={query} onChange={setQuery} results={matches} onPick={pick} />
        <CategoryFilters t={t} active={active} onToggle={(c) => setActive((s) => { const n = new Set(s); n.has(c) ? n.delete(c) : n.add(c); return n; })} />
        <div className="tools">
          <button onClick={() => { setDrawing((d) => !d); setDraft([]); setSelectedId(null); }}>{drawing ? t('cancel') : '＋ ' + t('addBuilding')}</button>
          <button onClick={exportGeo}>{t('exportGeo')}</button>
          <button onClick={() => fileRef.current && fileRef.current.click()}>{t('importGeo')}</button>
          <input ref={fileRef} type="file" accept=".geojson,.json" hidden onChange={(e) => e.target.files[0] && importGeo(e.target.files[0])} />
        </div>
        {drawing && (
          <div className="banner">{t('drawHint')} <button onClick={() => setDraft((d) => d.slice(0, -1))}>{t('undo')}</button> <button onClick={finishDraw} disabled={draft.length < 3}>{t('finish')}</button></div>
        )}
        {osm.status === 'loading' && <div className="banner">{t('loading')}</div>}
        {osm.status === 'error' && <div className="banner err">{t('loadError')}: {osm.error} <button onClick={() => fetchData(true)}>{t('retry')}</button></div>}
        {osm.status === 'ok' && buildings.length === 0 && <div className="banner">{t('empty')}</div>}
        {notice && <div className="banner">{notice}</div>}
      </div>

      <LocateButton t={t} disabled={!pos} onClick={() => pos && setFlyTo({ lat: pos.lat, lon: pos.lon, k: Date.now() })} />
      {selected && <BuildingPanel key={selected.id} t={t} feature={selected} coords={coords} onSave={saveProps} onDelete={del} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
