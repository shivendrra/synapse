import type { User } from '../types';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const API_KEY = process.env.GOOGLE_AUTH_KEY;
const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly';

let tokenClient: any = null;

const gapiLoad = () => new Promise<void>((resolve) => (window as any).gapi.load('client', resolve));

const gisLoad = () => new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if ((window as any).google?.accounts?.oauth2 || existingScript) {
        return resolve();
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services script.'));
    document.body.appendChild(script);
});

export const initClient = async () => {
    if (!CLIENT_ID) {
        throw new Error('Google Client ID is not configured. Please set the GOOGLE_CLIENT_ID environment variable.');
    }
    if (!API_KEY) {
        throw new Error('YouTube API Key is not configured. Please set the YOUTUBE_API_KEY environment variable.');
    }

    try {
        await Promise.all([gapiLoad(), gisLoad()]);
        
        await (window as any).gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
        });

        tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: () => {}, 
        });
    } catch (e: any) {
        let errorMessage = 'An unknown error occurred during Google client initialization.';
        if (e?.result?.error?.message) {
            errorMessage = e.result.error.message;
        } else if (e?.details) {
            errorMessage = e.details;
        } else if (e?.error) {
            errorMessage = typeof e.error === 'string' ? e.error : JSON.stringify(e.error);
        } else if (e?.message) {
            errorMessage = e.message;
        } else if (typeof e === 'object') {
            errorMessage = JSON.stringify(e);
        }
        throw new Error(`Google Client Error: ${errorMessage}`);
    }
};

export const requestYouTubeAccess = () => new Promise<any>((resolve, reject) => {
    if (!tokenClient) {
        reject(new Error("Google Identity Services client not initialized."));
        return;
    }
    
    tokenClient.callback = (resp: any) => {
        if (resp.error !== undefined) {
            reject(new Error(resp.error?.details || 'An unknown sign-in error occurred.'));
            return;
        }
        (window as any).gapi.client.setToken(resp);
        resolve(resp);
    };

    tokenClient.requestAccessToken({ prompt: 'consent' });
});

export const revokeYouTubeAccess = (token: string) => new Promise<void>((resolve) => {
    if ((window as any).google?.accounts?.oauth2) {
        (window as any).google.accounts.oauth2.revoke(token, () => {
            (window as any).gapi.client.setToken(null);
            resolve();
        });
    } else {
        (window as any).gapi.client.setToken(null);
        resolve();
    }
});


export const getCurrentUserProfile = async (): Promise<Pick<User, 'channelId' | 'name' | 'photoURL'> | null> => {
    if (!(window as any).gapi?.client?.getToken()) {
        return null;
    }
    try {
        const response = await (window as any).gapi.client.youtube.channels.list({
            part: 'snippet',
            mine: true,
        });

        if (response.result.items && response.result.items.length > 0) {
            const channel = response.result.items[0];
            return {
                channelId: channel.id,
                name: channel.snippet.title,
                photoURL: channel.snippet.thumbnails.default.url,
            };
        }
        return null;
    } catch (error: any) {
        console.error("Error fetching user profile:", error.result?.error?.message || error);
        return null;
    }
};