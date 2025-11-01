import type { Track, Playlist, Subscription } from '../types';

const API_KEY = "AIzaSyBhbYzOh_B3snsiBlCEwI4DdUZbKJVHass";
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

const getApiKey = () => {
  if (!API_KEY) {
    throw new Error('YouTube API Key is not configured. Please set the YOUTUBE_API_KEY environment variable.');
  }
  return API_KEY;
}

const getAuthHeaders = () => {
  const token = (window as any).gapi?.client?.getToken();
  if (!token) throw new Error("YouTube user is not authenticated.");
  return {
    'Authorization': `Bearer ${token.access_token}`,
    'Content-Type': 'application/json',
  };
};

// Helper to parse YouTube's ISO 8601 duration format
const parseDuration = (duration: string): number => {
  if (!duration) return 0;
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;
  const hours = (parseInt(match[1]) || 0);
  const minutes = (parseInt(match[2]) || 0);
  const seconds = (parseInt(match[3]) || 0);
  return hours * 3600 + minutes * 60 + seconds;
};

const mapToTrack = (item: any, details?: any): Track => ({
  videoId: typeof item.id === 'string' ? item.id : item.id?.videoId || item.snippet?.resourceId?.videoId,
  title: item.snippet.title,
  artist: item.snippet.channelTitle,
  channelId: item.snippet.channelId,
  thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
  duration: details ? parseDuration(details.contentDetails?.duration) : 0,
});

const fetchVideoDetails = async (videoIds: string[]): Promise<any[]> => {
  if (videoIds.length === 0) return [];
  const response = await fetch(`${BASE_URL}/videos?part=contentDetails&id=${videoIds.join(',')}&key=${getApiKey()}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }
  const data = await response.json();
  return data.items;
}

export const searchVideos = async (query: string): Promise<Track[]> => {
  const response = await fetch(`${BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&maxResults=20&key=${getApiKey()}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }
  const data = await response.json();
  const videoIds = data.items.map((item: any) => item.id.videoId).filter(Boolean);
  const details = await fetchVideoDetails(videoIds);

  const detailsMap = details.reduce((acc, detail) => {
    acc[detail.id] = detail;
    return acc;
  }, {});

  return data.items
    .map((item: any) => mapToTrack(item, detailsMap[item.id.videoId]))
    .filter((track: Track) => track.duration > 0);
};

export const getTrendingMusic = async (): Promise<Track[]> => {
  const response = await fetch(`${BASE_URL}/videos?part=snippet,contentDetails&chart=mostPopular&videoCategoryId=10&maxResults=20&regionCode=US&key=${getApiKey()}`);
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
  const response = await fetch(`${BASE_URL}/channels?part=snippet,statistics,brandingSettings&id=${channelId}&key=${getApiKey()}`);
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

export const getChannelVideos = async (channelId: string, pageToken?: string): Promise<{ tracks: Track[], nextPageToken: string | null }> => {
  let url = `${BASE_URL}/search?part=snippet&channelId=${channelId}&maxResults=50&type=video&order=date&key=${getApiKey()}`;
  if (pageToken) {
    url += `&pageToken=${pageToken}`;
  }

  const searchResponse = await fetch(url);
  if (!searchResponse.ok) {
    const error = await searchResponse.json();
    throw new Error(error.error.message);
  }
  const searchData = await searchResponse.json();
  const videoIds = searchData.items.map((item: any) => item.id.videoId).filter(Boolean);

  if (videoIds.length === 0) return { tracks: [], nextPageToken: null };

  const details = await fetchVideoDetails(videoIds);

  const detailsMap = details.reduce((acc, detail) => {
    acc[detail.id] = detail;
    return acc;
  }, {});

  const tracks = searchData.items
    .map((item: any) => mapToTrack(item, detailsMap[item.id.videoId]))
    .filter((track: Track) => track.duration > 61);

  return {
    tracks,
    nextPageToken: searchData.nextPageToken || null
  };
};

// Authenticated requests
export const getUserPlaylists = async (): Promise<Playlist[]> => {
  const response = await fetch(`${BASE_URL}/playlists?part=snippet,contentDetails&mine=true&maxResults=50`, { headers: getAuthHeaders() });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to fetch playlists: ${error.error.message}`);
  }
  const data = await response.json();
  return data.items.map((p: any) => ({
    id: p.id,
    name: p.snippet.title,
    trackCount: p.contentDetails.itemCount,
    ownerName: p.snippet.channelTitle,
    thumbnail: p.snippet.thumbnails.medium?.url,
    tracks: [],
    source: 'youtube'
  }));
};

export const getPlaylistItems = async (playlistId: string): Promise<Track[]> => {
  const response = await fetch(`${BASE_URL}/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50`, { headers: getAuthHeaders() });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to fetch playlist items: ${error.error.message}`);
  }
  const data = await response.json();
  const videoIds = data.items.map((item: any) => item.snippet.resourceId.videoId).filter(Boolean);
  const details = await fetchVideoDetails(videoIds);
  const detailsMap = details.reduce((acc, detail) => {
    acc[detail.id] = detail;
    return acc;
  }, {});

  return data.items.map((item: any) => mapToTrack(item, detailsMap[item.snippet.resourceId.videoId]));
};

export const getSubscriptionFeed = async (): Promise<Subscription[]> => {
  const response = await fetch(`${BASE_URL}/subscriptions?part=snippet&mine=true&maxResults=50&order=unread`, { headers: getAuthHeaders() });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to fetch subscriptions: ${error.error.message}`);
  }
  const data = await response.json();
  return data.items.map((s: any) => ({
    channelId: s.snippet.resourceId.channelId,
    title: s.snippet.title,
    thumbnail: s.snippet.thumbnails.default.url,
  }));
};