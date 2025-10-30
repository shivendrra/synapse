import type { User, Playlist, Track } from '../types';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGE_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase
const app = (window as any).firebase.initializeApp(firebaseConfig);
export const auth = (window as any).firebase.auth();
export const db = (window as any).firebase.firestore();
const googleProvider = new (window as any).firebase.auth.GoogleAuthProvider();

export const onLoginWithGoogle = () => {
  return auth.signInWithPopup(googleProvider);
};

export const onLogout = () => {
  return auth.signOut();
};

export const signUpWithEmail = async (email: string, password: string):Promise<any> => {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    await userCredential.user.updateProfile({
        displayName: email.split('@')[0],
        photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${email.split('@')[0]}`
    });
    // Create a user document in Firestore
    await db.collection('users').doc(userCredential.user.uid).set({
        name: email.split('@')[0],
        email: userCredential.user.email,
    });
    return userCredential.user;
};

export const signInWithEmail = (email: string, password: string):Promise<any> => {
    return auth.signInWithEmailAndPassword(email, password);
};

const usersCollection = db.collection('users');
const playlistsCollection = db.collection('playlists');

// User Data Management
export const getUserData = async (uid: string) => {
    const userDoc = await usersCollection.doc(uid).get();
    return userDoc.exists ? userDoc.data() : null;
};

export const saveYouTubeToken = async (uid: string, token: any) => {
    return usersCollection.doc(uid).set({ youtubeToken: token }, { merge: true });
};

export const clearYouTubeToken = async (uid: string) => {
    return usersCollection.doc(uid).update({
        youtubeToken: (window as any).firebase.firestore.FieldValue.delete()
    });
};

// Playlist Management
export const getPlaylists = async (userId: string): Promise<Playlist[]> => {
  const snapshot = await playlistsCollection.where('ownerId', '==', userId).get();
  if (snapshot.empty) return [];
  return snapshot.docs.map((doc: any) => ({ 
      id: doc.id, 
      ...doc.data(),
      source: 'firebase' 
  } as Playlist));
};

export const getPlaylist = async (playlistId: string): Promise<Playlist> => {
    const doc = await playlistsCollection.doc(playlistId).get();
    if (!doc.exists) throw new Error("Playlist not found");
    return { id: doc.id, ...doc.data(), source: 'firebase' } as Playlist;
};

export const addTrackToPlaylist = async (playlistId: string, track: Track) => {
    const playlistRef = playlistsCollection.doc(playlistId);
    await db.runTransaction(async (transaction: any) => {
        const doc = await transaction.get(playlistRef);
        if (!doc.exists) throw new Error("Playlist does not exist!");
        
        const data = doc.data();
        const tracks = data.tracks || [];
        if (tracks.some((t: Track) => t.videoId === track.videoId)) return;

        transaction.update(playlistRef, {
            tracks: (window as any).firebase.firestore.FieldValue.arrayUnion(track),
            trackCount: (window as any).firebase.firestore.FieldValue.increment(1)
        });
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
        createdAt: (window as any).firebase.firestore.FieldValue.serverTimestamp(),
    });
    return newPlaylistRef.id;
};