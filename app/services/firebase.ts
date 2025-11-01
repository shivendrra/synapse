import type { User, Playlist, Track } from '../types';


// IMPORTANT: Using the provided Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDAuyBNXc4ev0VimJU_TkBkYmdzgRMK5pk",
  authDomain: "synapsemusic.firebaseapp.com",
  projectId: "synapsemusic",
  storageBucket: "synapsemusic.appspot.com",
  messagingSenderId: "491908510557",
  appId: "1:491908510557:web:866415232b503433a08859"
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
    // The user document will be created by the onAuthStateChanged listener
    return userCredential.user;
};

export const signInWithEmail = (email: string, password: string):Promise<any> => {
    return auth.signInWithEmailAndPassword(email, password);
};

// Account Management
export const reauthenticateUser = async (password: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error("No user is currently signed in.");

    const credential = (window as any).firebase.auth.EmailAuthProvider.credential(user.email, password);
    try {
        await user.reauthenticateWithCredential(credential);
    } catch (error: any) {
        if (error.code === 'auth/wrong-password') {
            throw new Error('The password you entered is incorrect.');
        }
        throw new Error('Re-authentication failed. Please try again.');
    }
};

export const updateUserPassword = async (newPassword: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user is currently signed in.");
    await user.updatePassword(newPassword);
};

export const deleteUserAccount = async (): Promise<void> => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user is currently signed in.");
    
    // Optional: Delete user data from Firestore first
    // await usersCollection.doc(user.uid).delete();
    
    await user.delete();
};


const usersCollection = db.collection('users');
const playlistsCollection = db.collection('playlists');

// User Data Management
export const ensureUserDocument = async (user: { uid: string; email: string; displayName: string | null; photoURL: string | null; }) => {
    if (!user) return;
    const userRef = usersCollection.doc(user.uid);
    const snapshot = await userRef.get();

    if (!snapshot.exists) {
        const { email, displayName, photoURL } = user;
        const createdAt = (window as any).firebase.firestore.FieldValue.serverTimestamp();
        const userName = displayName || email.split('@')[0];
        try {
            await userRef.set({
                name: userName,
                email,
                photoURL: photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${userName}`,
                createdAt
            });
            // Create default "Liked Songs" playlist for new users
            await getOrCreateLikedSongsPlaylist(user.uid, userName);
        } catch (error) {
            console.error("Error creating user document and default playlist:", error);
            throw error;
        }
    }
};

export const updateUserProfile = async (updates: { displayName?: string, photoURL?: string }) => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user is currently signed in.");

    await user.updateProfile({
        displayName: updates.displayName,
        photoURL: updates.photoURL,
    });
    
    const userRef = usersCollection.doc(user.uid);
    const firestoreUpdates: { name?: string, photoURL?: string } = {};
    if (updates.displayName) firestoreUpdates.name = updates.displayName;
    if (updates.photoURL) firestoreUpdates.photoURL = updates.photoURL;

    if (Object.keys(firestoreUpdates).length > 0) {
        await userRef.update(firestoreUpdates);
    }
};

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

export const getOrCreateLikedSongsPlaylist = async (userId: string, userName: string): Promise<{ ref: any, data: Playlist }> => {
    const query = playlistsCollection
        .where('ownerId', '==', userId)
        .where('specialType', '==', 'liked-songs');
        
    const snapshot = await query.get();

    if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { ref: doc.ref, data: { id: doc.id, ...doc.data(), source: 'firebase' } as Playlist };
    } else {
        // Create it
        const newPlaylistRef = playlistsCollection.doc();
        const playlistData = {
            name: "Liked Songs",
            ownerId: userId,
            ownerName: userName,
            tracks: [],
            trackCount: 0,
            createdAt: (window as any).firebase.firestore.FieldValue.serverTimestamp(),
            specialType: 'liked-songs',
            thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=512&q=80'
        };
        await newPlaylistRef.set(playlistData);
        return { ref: newPlaylistRef, data: { id: newPlaylistRef.id, ...playlistData, source: 'firebase' } as Playlist };
    }
};

export const likeTrack = async (user: User, track: Track) => {
    const { ref } = await getOrCreateLikedSongsPlaylist(user.uid, user.name);
    await db.runTransaction(async (transaction: any) => {
        const doc = await transaction.get(ref);
        if (!doc.exists) throw new Error("Playlist does not exist!");
        
        const data = doc.data();
        const tracks = data.tracks || [];
        if (tracks.some((t: Track) => t.videoId === track.videoId)) return;

        transaction.update(ref, {
            tracks: (window as any).firebase.firestore.FieldValue.arrayUnion(track),
            trackCount: (window as any).firebase.firestore.FieldValue.increment(1)
        });
    });
};

export const unlikeTrack = async (userId: string, track: Track) => {
    const query = playlistsCollection
        .where('ownerId', '==', userId)
        .where('specialType', '==', 'liked-songs');
        
    const snapshot = await query.get();
    if (snapshot.empty) return;

    const playlistRef = snapshot.docs[0].ref;
    await playlistRef.update({
        tracks: (window as any).firebase.firestore.FieldValue.arrayRemove(track),
        trackCount: (window as any).firebase.firestore.FieldValue.increment(-1)
    });
};


// Playlist Management
export const getPlaylists = async (userId: string): Promise<Playlist[]> => {
  // Removed .orderBy('createdAt') to prevent the composite index requirement error.
  // Sorting will be handled client-side.
  const snapshot = await playlistsCollection.where('ownerId', '==', userId).get();
  if (snapshot.empty) return [];

  const playlists = snapshot.docs.map((doc: any) => ({ 
      id: doc.id, 
      ...doc.data(),
      source: 'firebase' 
  } as Playlist));

  // Sort playlists by creation date on the client side.
  // This ensures a consistent order without needing a special database index.
  return playlists.sort((a: any, b: any) => {
    const timeA = a.createdAt?.toMillis() || 0;
    const timeB = b.createdAt?.toMillis() || 0;
    return timeA - timeB; // Sorts ascending (oldest first)
  });
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
        if (tracks.some((t: Track) => t.videoId === track.videoId)) {
            // Track already exists, do nothing.
            return;
        };

        transaction.update(playlistRef, {
            tracks: (window as any).firebase.firestore.FieldValue.arrayUnion(track),
            trackCount: (window as any).firebase.firestore.FieldValue.increment(1),
            thumbnail: track.thumbnail
        });
    });
};

export const removeTrackFromPlaylist = async (playlistId: string, track: Track) => {
    const playlistRef = playlistsCollection.doc(playlistId);
    await db.runTransaction(async (transaction: any) => {
        const doc = await transaction.get(playlistRef);
        if (!doc.exists) throw new Error("Playlist does not exist!");

        const data = doc.data();
        const tracks = data.tracks || [];
        if (tracks.some((t: Track) => t.videoId === track.videoId)) {
            transaction.update(playlistRef, {
                tracks: (window as any).firebase.firestore.FieldValue.arrayRemove(track),
                trackCount: (window as any).firebase.firestore.FieldValue.increment(-1)
            });
        }
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
