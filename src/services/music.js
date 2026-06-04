import { youtubeApiKey, jamendoClientId } from '../config/keys';

// Example usage (adapt to your current music.js):
// const youtube = new YouTubeAPI(youtubeApiKey);
// const jamendo = new JamendoAPI(jamendoClientId);
// For Audius, no key needed (or you can import a base URL if defined in keys.js)

// Keep the rest of your music logic unchanged, but replace hardcoded API keys with the imported ones.
export const fetchTrendingShorts = async (regionCode = 'IN', maxResults = 20) => {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoDuration=short&maxResults=${maxResults}&regionCode=${regionCode}&key=${youtubeApiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  if (!data.items) return [];
  return data.items.map(item => ({
    id: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.high.url,
    channelId: item.snippet.channelId,
    channelTitle: item.snippet.channelTitle,
    description: item.snippet.description,
  }));
};

export const fetchVideoDetails = async (videoId) => {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoId}&key=${youtubeApiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.items && data.items[0]) {
    return data.items[0];
  }
  return null;
};
// Fetch long videos (1 min to 2 hours) from YouTube
export const fetchLongYouTubeVideos = async (maxResults = 10, pageToken = null) => {
  // Search for popular videos in various categories (to get long-form content)
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoDuration=long&maxResults=50&order=viewCount&key=${youtubeApiKey}`;
  const response = await fetch(searchUrl);
  const data = await response.json();
  if (!data.items) return [];
  
  // Get video IDs to fetch durations
  const videoIds = data.items.map(item => item.id.videoId).join(',');
  const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${youtubeApiKey}`;
  const detailsRes = await fetch(detailsUrl);
  const detailsData = await detailsRes.json();
  
  const durationMap = {};
  detailsData.items.forEach(item => {
    const durationISO = item.contentDetails.duration;
    const seconds = parseISODuration(durationISO);
    durationMap[item.id] = seconds;
  });
  
  // Filter between 60 sec and 7200 sec (2 hours)
  const longVideos = data.items.filter(item => {
    const seconds = durationMap[item.id.videoId];
    return seconds >= 60 && seconds <= 7200;
  }).slice(0, maxResults);
  
  return longVideos.map(item => ({
    id: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.high.url,
    channelTitle: item.snippet.channelTitle,
    channelId: item.snippet.channelId,
    description: item.snippet.description,
    duration: durationMap[item.id.videoId],
    type: 'youtube_broadcast',
  }));
};

// Helper: convert ISO 8601 duration to seconds
function parseISODuration(iso) {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = iso.match(regex);
  const hours = parseInt(matches[1] || 0);
  const minutes = parseInt(matches[2] || 0);
  const seconds = parseInt(matches[3] || 0);
  return hours * 3600 + minutes * 60 + seconds;
}
