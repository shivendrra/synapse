
import type { Track } from '../types';

const API_KEY = process.env.YT_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Helper to parse YouTube's ISO 8601 duration format
const parseDuration = (duration: string): number => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;
  const hours = (parseInt(match[1]) || 0);
  const minutes = (parseInt(match[2]) || 0);
  const seconds = (parseInt(match[3]) || 0);
  return hours * 3600 + minutes * 60 + seconds;
};

const mapToTrack = (item: any, details?: any): Track => ({
  videoId: typeof item.id === 'string' ? item.id : item.id.videoId,
  title: item.snippet.title,
  artist: item.snippet.channelTitle,
  channelId: item.snippet.channelId,
  thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
  duration: details ? parseDuration(details.contentDetails.duration) : 0,
});

const fetchVideoDetails = async (videoIds: string[]): Promise<any[]> => {
  if (videoIds.length === 0) return [];
  const response = await fetch(`${BASE_URL}/videos?part=contentDetails&id=${videoIds.join(',')}&key=${API_KEY}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }
  const data = await response.json();
  return data.items;
}

export const searchVideos = async (query: string): Promise<Track[]> => {
  const response = await fetch(`${BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=20&key=${API_KEY}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }
  const data = await response.json();
  const videoIds = data.items.map((item: any) => item.id.videoId);
  const details = await fetchVideoDetails(videoIds);

  const detailsMap = details.reduce((acc, detail) => {
    acc[detail.id] = detail;
    return acc;
  }, {});

  return data.items
    .map((item: any) => mapToTrack(item, detailsMap[item.id.videoId]))
    .filter((track: Track) => track.duration > 61); // Filter out shorts
};

export const getTrendingMusic = async (): Promise<Track[]> => {
  const response = await fetch(`${BASE_URL}/videos?part=snippet,contentDetails&chart=mostPopular&videoCategoryId=10&maxResults=20&regionCode=US&key=${API_KEY}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }
  const data = await response.json();
  return data.items
    .map((item: any) => mapToTrack(item, item))
    .filter((track: Track) => track.duration > 61); // Filter out shorts
};

export const getChannelDetails = async (channelId: string) => {
  const response = await fetch(`${BASE_URL}/channels?part=snippet,statistics,brandingSettings&id=${channelId}&key=${API_KEY}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }
  const data = await response.json();
  if (!data.items || data.items.length === 0) {
    throw new Error("Channel not found");
  }
  return data.items[0];
};

export const getChannelVideos = async (channelId: string): Promise<Track[]> => {
  // Find all videos for the channel, this is more reliable than using the 'uploads' playlist
  const searchResponse = await fetch(`${BASE_URL}/search?part=snippet&channelId=${channelId}&maxResults=50&type=video&order=date&key=${API_KEY}`);
  if (!searchResponse.ok) {
    const error = await searchResponse.json();
    throw new Error(error.error.message);
  }
  const searchData = await searchResponse.json();
  const videoIds = searchData.items.map((item: any) => item.id.videoId);

  if (videoIds.length === 0) {
    return [];
  }

  const details = await fetchVideoDetails(videoIds);

  const detailsMap = details.reduce((acc, detail) => {
    acc[detail.id] = detail;
    return acc;
  }, {});

  return searchData.items
    .map((item: any) => mapToTrack(item, detailsMap[item.id.videoId]))
    .filter((track: Track) => track.duration > 61); // Filter out shorts
};
