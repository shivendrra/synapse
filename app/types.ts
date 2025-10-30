export interface Track {
  videoId: string;
  title: string;
  artist: string; // channel name
  channelId: string;
  thumbnail: string;
  duration: number; // in seconds
}

export interface User {
  uid: string; // Firebase UID
  name: string;
  email: string;
  photoURL: string;
  // YouTube specific, optional
  channelId?: string; 
  youtubeToken?: any | null;
}

export interface Playlist {
  id: string;
  name: string;
  trackCount: number;
  ownerName: string;
  thumbnail?: string;
  tracks: Track[];
  source: 'firebase' | 'youtube';
}

export interface Subscription {
  channelId: string;
  title: string;
  thumbnail: string;
}