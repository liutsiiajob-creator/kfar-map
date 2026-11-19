// Map OSM tags to our categories. Unknown stays "other" - nothing is guessed beyond tags.
export function categoryFromTags(t = {}) {
  const b = t.building, a = t.amenity;
  if (['school', 'kindergarten', 'university', 'college'].includes(b) || ['school', 'kindergarten', 'university', 'college', 'library'].includes(a)) return 'educational';
  if (['townhall', 'police', 'fire_station', 'post_office', 'courthouse'].includes(a) || ['government', 'civic', 'office', 'public'].includes(b) || t.office) return 'administrative';
  if (['place_of_worship', 'community_centre', 'clinic', 'doctors', 'shelter', 'social_facility'].includes(a) || ['synagogue', 'church', 'mosque', 'religious', 'hospital', 'shelter'].includes(b) || t.leisure === 'sports_centre') return 'public';
  if (['farm', 'farm_auxiliary', 'barn', 'greenhouse', 'stable', 'cowshed', 'silo', 'agricultural'].includes(b)) return 'agricultural';
  if (['house', 'residential', 'apartments', 'detached', 'semidetached_house', 'terrace', 'dormitory', 'bungalow'].includes(b)) return 'residential';
  return 'other';
}
