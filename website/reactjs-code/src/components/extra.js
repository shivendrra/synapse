const express = require('express');
const axios = require('axios');
const cors = require('cors');
const ytdl = require('ytdl-core');
const fluentFfmpeg = require('fluent-ffmpeg');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const API_KEY = 'AIzaSyDoRWJ7lnJ0JuoLgEdmwxuSFj3HCA5YB8g'; // Replace with your actual YouTube API key

app.post('/search', async (req, res) => {

  try {
    const { query } = req.body;
    const maxResults = 20;

    fluentFfmpeg('/path/to/input.mp4')
      .audioCodec('aac')
      .videoCodec('libx264')
      .toFormat('mp4')
      .on('end', () => {
        console.log('Conversion finished');
      })
      .on('error', (err) => {
        console.error('Error:', err);
      })
      .save('/path/to/output.mp4');

    // Make a request to the YouTube Data API to search for videos
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        key: API_KEY,
        q: query,
        part: 'snippet',
        type: 'video',
        maxResults: maxResults, // You can set the desired number of results
      },
    });

    // Extract video data from the response
    const videoItems = response.data.items;

    // Fetch video details and audio URLs
    const videos = await Promise.all(videoItems.map(async (item) => {
      const videoId = item.id.videoId;
      const videoDetails = await fetchVideoDetails(videoId);
      const audioUrl = await fetchAudioUrl(videoId);

      return {
        videoId,
        title: videoDetails.title,
        channel: videoDetails.channelTitle,
        thumbnailUrl: item.snippet.thumbnails.high.url,
        audioUrl,
      };
    }));

    res.json(videos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching videos.' });
  }
});

async function fetchVideoDetails(videoId) {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        key: API_KEY,
        id: videoId,
        part: 'snippet',
      },
    });
    const snippet = response.data.items[0].snippet;
    return {
      title: snippet.title,
      channelTitle: snippet.channelTitle,
    };
  } catch (error) {
    console.error(error);
    return {};
  }
}

async function fetchAudioUrl(videoId) {
  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const audioInfo = await ytdl.getInfo(videoUrl);
    const audioFormat = ytdl.chooseFormat(audioInfo.formats, { quality: 'highestaudio' });
    const audioUrl = audioFormat.url;
    return audioUrl;
  } catch (error) {
    console.error(error);
    return null;
  }
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
