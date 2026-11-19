export const LANGS = { he: { dir: 'rtl', name: 'עברית' }, ru: { dir: 'ltr', name: 'Русский' }, en: { dir: 'ltr', name: 'English' } };
const T = {
  he: {
    title: 'מפת כפר חסידים', search: 'חיפוש לפי שם, מספר או קטגוריה', clear: 'נקה', myLocation: 'המיקום שלי',
    locDenied: 'אין הרשאת מיקום. מוצגת המפה הרגילה.', locUnavailable: 'המיקום אינו זמין.',
    loading: 'טוען נתוני מפה…', loadError: 'שגיאה בטעינת הנתונים', retry: 'נסה שוב', empty: 'לא נמצאו מבנים באזור. אפשר להוסיף ידנית.',
    cat_residential: 'מגורים', cat_educational: 'חינוך', cat_administrative: 'מנהלה', cat_public: 'ציבורי', cat_agricultural: 'חקלאי', cat_other: 'אחר',
    name: 'שם', number: 'מספר', category: 'קטגוריה', description: 'תיאור', notes: 'הערות', photo: 'תמונה', save: 'שמור', cancel: 'ביטול', edit: 'עריכה', del: 'מחק', close: 'סגור',
    addBuilding: 'הוסף מבנה', finish: 'סיים', undo: 'בטל נקודה', drawHint: 'לחצו על המפה כדי לסמן את פינות המבנה (לפחות 3).',
    exportGeo: 'ייצוא GeoJSON', importGeo: 'ייבוא GeoJSON', source: 'מקור', osm: 'OpenStreetMap', manual: 'ידני', coords: 'קואורדינטות',
    results: 'תוצאות', noResults: 'אין תוצאות', layers: 'שכבות', filters: 'קטגוריות',
  },
  ru: {
    title: 'Карта Кфар-Хасидим', search: 'Поиск по названию, номеру или категории', clear: 'Очистить', myLocation: 'Моё местоположение',
    locDenied: 'Нет доступа к геолокации. Показана обычная карта.', locUnavailable: 'Местоположение недоступно.',
    loading: 'Загрузка данных карты…', loadError: 'Ошибка загрузки данных', retry: 'Повторить', empty: 'В этой области нет зданий. Можно добавить вручную.',
    cat_residential: 'Жилые', cat_educational: 'Учебные', cat_administrative: 'Административные', cat_public: 'Общественные', cat_agricultural: 'Хозяйственные', cat_other: 'Другие',
    name: 'Название', number: 'Номер', category: 'Категория', description: 'Описание', notes: 'Заметки', photo: 'Фото', save: 'Сохранить', cancel: 'Отмена', edit: 'Изменить', del: 'Удалить', close: 'Закрыть',
    addBuilding: 'Добавить здание', finish: 'Готово', undo: 'Убрать точку', drawHint: 'Нажимайте на карту, отмечая углы здания (минимум 3).',
    exportGeo: 'Экспорт GeoJSON', importGeo: 'Импорт GeoJSON', source: 'Источник', osm: 'OpenStreetMap', manual: 'Вручную', coords: 'Координаты',
    results: 'Результаты', noResults: 'Ничего не найдено', layers: 'Слои', filters: 'Категории',
  },
  en: {
    title: 'Kfar Hasidim Map', search: 'Search by name, number or category', clear: 'Clear', myLocation: 'My Location',
    locDenied: 'Location permission denied. Showing the default map.', locUnavailable: 'Location unavailable.',
    loading: 'Loading map data…', loadError: 'Failed to load data', retry: 'Retry', empty: 'No buildings found in this area. You can add them manually.',
    cat_residential: 'Residential', cat_educational: 'Educational', cat_administrative: 'Administrative', cat_public: 'Public', cat_agricultural: 'Agricultural', cat_other: 'Other',
    name: 'Name', number: 'Number', category: 'Category', description: 'Description', notes: 'Notes', photo: 'Photo', save: 'Save', cancel: 'Cancel', edit: 'Edit', del: 'Delete', close: 'Close',
    addBuilding: 'Add building', finish: 'Finish', undo: 'Undo point', drawHint: 'Click the map to mark the building corners (at least 3).',
    exportGeo: 'Export GeoJSON', importGeo: 'Import GeoJSON', source: 'Source', osm: 'OpenStreetMap', manual: 'Manual', coords: 'Coordinates',
    results: 'Results', noResults: 'No results', layers: 'Layers', filters: 'Categories',
  },
};
export const makeT = (lang) => (k) => (T[lang] && T[lang][k]) || T.en[k] || k;
