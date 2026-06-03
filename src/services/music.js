// ================================================================
// AIACON MUSIC ENGINE
// YouTube + Jamendo + Audius — 102M+ songs combined
// ================================================================

const JAMENDO_CLIENT_ID = 'REAL_JAMENDO_ID';
const YOUTUBE_API_KEY = 'AIzaSyCJwhiQbImxQr6P-mTqZdx0n5xNKJN3WSE';
const AUDIUS_API = 'https://api.audius.co';

// ==================== SEARCH ALL SERVICES ====================
export async function searchMusic(query) {
  const results = [];

  // 1. YouTube (100M songs)
  try {
    const ytResults = await searchYouTube(query);
    results.push(...ytResults);
  } catch (e) { console.warn('YouTube search failed'); }

  // 2. Jamendo (500K songs)
  try {
    const jamResults = await searchJamendo(query);
    results.push(...jamResults);
  } catch (e) { console.warn('Jamendo search failed'); }

  // 3. Audius (1M songs, decentralized)
  try {
    const audResults = await searchAudius(query);
    results.push(...audResults);
  } catch (e) { console.warn('Audius search failed'); }

  return results;
}

// ==================== YOUTUBE ====================
async function searchYouTube(query) {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query + ' song')}&type=video&videoCategoryId=10&key=${YOUTUBE_API_KEY}`
  );
  const data = await res.json();
  return (data.items || []).map(item => ({
    id: item.id.videoId,
    title: item.snippet.title,
    artist: item.snippet.channelTitle,
    albumArt: item.snippet.thumbnails.high.url,
    previewUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    duration: 0,
    source: 'youtube',
  }));
}

// ==================== JAMENDO ====================
async function searchJamendo(query) {
  const res = await fetch(
    `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=10&search=${encodeURIComponent(query)}&include=musicinfo`
  );
  const data = await res.json();
  return (data.results || []).map(track => ({
    id: track.id,
    title: track.name,
    artist: track.artist_name,
    albumArt: track.image || track.album_image,
    previewUrl: track.audio,
    duration: track.duration,
    source: 'jamendo',
  }));
}

// ==================== AUDIUS ====================
async function searchAudius(query) {
  const res = await fetch(
    `${AUDIUS_API}/v1/tracks/search?query=${encodeURIComponent(query)}`
  );
  const data = await res.json();
  return (data.data || []).map(track => ({
    id: track.id,
    title: track.title,
    artist: track.user?.name || 'Unknown',
    albumArt: track.artwork?.['480x480'] || track.artwork?.['150x150'],
    previewUrl: `${AUDIUS_API}/v1/tracks/${track.id}/stream`,
    duration: track.duration,
    source: 'audius',
  }));
}

// ==================== TRENDING ====================
export async function getTrendingMusic() {
  try {
    const res = await fetch(`${AUDIUS_API}/v1/tracks/trending`);
    const data = await res.json();
    return (data.data || []).slice(0, 15).map(track => ({
      id: track.id,
      title: track.title,
      artist: track.user?.name || 'Unknown',
      albumArt: track.artwork?.['480x480'] || track.artwork?.['150x150'],
      previewUrl: `${AUDIUS_API}/v1/tracks/${track.id}/stream`,
      duration: track.duration,
      source: 'audius',
    }));
  } catch (e) {
    return [];
  }
}

console.log('✅ AIACON Music Engine Ready');
