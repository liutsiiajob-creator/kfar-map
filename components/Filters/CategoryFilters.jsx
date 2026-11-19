import { CATEGORIES } from '../../data/config.js';

export default function CategoryFilters({ t, active, onToggle }) {
  return (
    <div className="filters" role="group" aria-label={t('filters')}>
      {Object.keys(CATEGORIES).map((c) => (
        <button key={c} className={active.has(c) ? 'on' : ''} onClick={() => onToggle(c)} aria-pressed={active.has(c)}>
          <i style={{ background: CATEGORIES[c].color }} /> {t('cat_' + c)}
        </button>
      ))}
    </div>
  );
}
