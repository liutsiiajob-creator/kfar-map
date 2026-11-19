export default function LocateButton({ t, onClick, disabled }) {
  return (
    <button className="locate" onClick={onClick} disabled={disabled} aria-label={t('myLocation')}>
      <span aria-hidden="true">◎</span> {t('myLocation')}
    </button>
  );
}
