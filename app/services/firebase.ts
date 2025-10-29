import type { User, Playlist, Track } from '../types';

console.log("API KEY: ", process.env.FIREBASE_API_KEY);

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGE_SENDER_ID,
};

const app = (window as any).firebase.initializeApp(firebaseConfig);
export const auth = (window as any).firebase.auth();
export const db = (window as any).firebase.firestore();
const googleProvider = new (window as any).firebase.auth.GoogleAuthProvider();

export const onLoginWithGoogle = () => {
  auth.signInWithPopup(googleProvider);
};

export const onLogout = () => {
  auth.signOut();
};

export const signUpWithEmail = async (email: string, password: string): Promise<any> => {
  const userCredential = await auth.createUserWithEmailAndPassword(email, password);
  await userCredential.user.updateProfile({
    displayName: email.split('@')[0]
  });
  return userCredential.user;
};

export const signInWithEmail = (email: string, password: string): Promise<any> => {
  return auth.signInWithEmailAndPassword(email, password);
};

const playlistsCollection = db.collection('playlists');

export const getPlaylists = async (userId: string): Promise<Playlist[]> => {
  const snapshot = await playlistsCollection.where('ownerId', '==', userId).get();
  if (snapshot.empty) {
    return [];
  }
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Playlist));
};

export const addTrackToPlaylist = async (playlistId: string, track: Track) => {
  const playlistRef = playlistsCollection.doc(playlistId);
  const playlistDoc = await playlistRef.get();

  if (!playlistDoc.exists) {
    throw new Error("Playlist not found");
  }

  const playlistData = playlistDoc.data();
  const tracks = playlistData?.tracks || [];

  // Avoid adding duplicate tracks
  if (tracks.some((t: Track) => t.videoId === track.videoId)) {
    console.log("Track already in playlist");
    return;
  }

  await playlistRef.update({
    tracks: (window as any).firebase.firestore.FieldValue.arrayUnion(track),
    trackCount: (window as any).firebase.firestore.FieldValue.increment(1)
  });
};

export const removeTrackFromPlaylist = async (playlistId: string, track: Track) => {
  const playlistRef = playlistsCollection.doc(playlistId);

  await playlistRef.update({
    tracks: (window as any).firebase.firestore.FieldValue.arrayRemove(track),
    trackCount: (window as any).firebase.firestore.FieldValue.increment(-1)
  });
};

export const createPlaylist = async (name: string, user: User): Promise<string> => {
  const newPlaylistRef = await playlistsCollection.add({
    name,
    ownerId: user.uid,
    ownerName: user.name,
    tracks: [],
    trackCount: 0,
  });
  return newPlaylistRef.id;
}