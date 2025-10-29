
export interface Track {
  videoId: string;
  title: string;
  artist: string; // channel name
  channelId: string;
  thumbnail: string;
  duration: number; // in seconds
}

export interface User {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
}

export interface Playlist {
  id: string;
  name: string;
  trackCount: number;
  ownerName: string;
  ownerId: string;
  tracks: Track[];
}
