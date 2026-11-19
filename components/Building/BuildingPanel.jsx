import { useState } from 'react';
import { CATEGORIES } from '../../data/config.js';

function resizeToDataUrl(file, max = 800) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export default function BuildingPanel({ t, feature, coords, onSave, onDelete, onClose }) {
  const p = feature.properties;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(p);
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  const manual = p.source === 'manual';

  return (
    <aside className="panel" role="dialog" aria-label={p.name || p.id}>
      <button className="x" onClick={onClose} aria-label={t('close')}>✕</button>
      {p.photo && <img className="photo" src={p.photo} alt="" />}
      {!editing ? (
        <>
          <h2>{p.number ? `${p.number}. ` : ''}{p.name || '—'}</h2>
          <p><span className="chip" style={{ background: CATEGORIES[p.category].color }}>{t('cat_' + p.category)}</span></p>
          {p.description && <p>{p.description}</p>}
          {p.notes && <p className="muted">{p.notes}</p>}
          <p className="muted small">{t('source')}: {t(manual ? 'manual' : 'osm')} · {feature.id}<br />{t('coords')}: {coords.lat.toFixed(6)}, {coords.lon.toFixed(6)}</p>
          <div className="row">
            <button onClick={() => { setDraft(p); setEditing(true); }}>{t('edit')}</button>
            {manual && <button className="danger" onClick={() => onDelete(feature.id)}>{t('del')}</button>}
          </div>
        </>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); onSave(feature.id, draft); setEditing(false); }}>
          <label>{t('name')}<input value={draft.name || ''} onChange={(e) => set('name', e.target.value)} /></label>
          <label>{t('number')}<input value={draft.number || ''} onChange={(e) => set('number', e.target.value)} /></label>
          <label>{t('category')}
            <select value={draft.category} onChange={(e) => set('category', e.target.value)}>
              {Object.keys(CATEGORIES).map((c) => <option key={c} value={c}>{t('cat_' + c)}</option>)}
            </select>
          </label>
          <label>{t('description')}<textarea rows="3" value={draft.description || ''} onChange={(e) => set('description', e.target.value)} /></label>
          <label>{t('notes')}<textarea rows="2" value={draft.notes || ''} onChange={(e) => set('notes', e.target.value)} /></label>
          <label>{t('photo')}<input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files[0]; if (f) set('photo', await resizeToDataUrl(f)); }} /></label>
          <div className="row"><button type="submit">{t('save')}</button><button type="button" onClick={() => setEditing(false)}>{t('cancel')}</button></div>
        </form>
      )}
    </aside>
  );
}
