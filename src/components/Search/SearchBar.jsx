export default function SearchBar({ t, value, onChange, results, onPick }) {
  return (
    <div className="search">
      <div className="searchrow">
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={t('search')} aria-label={t('search')} />
        {value && <button onClick={() => onChange('')} aria-label={t('clear')}>✕</button>}
      </div>
      {value && (
        <ul className="results">
          {results.length === 0 && <li className="muted">{t('noResults')}</li>}
          {results.slice(0, 8).map((f) => (
            <li key={f.id}><button onClick={() => onPick(f.id)}>
              <b>{f.properties.number || '·'}</b> {f.properties.name || '—'} <span className="muted">{t('cat_' + f.properties.category)}</span>
            </button></li>
          ))}
        </ul>
      )}
    </div>
  );
}
