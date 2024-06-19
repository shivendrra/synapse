const express = require('express');
const axios = require('axios');
const router = express.Router();

router.use(express.json());

const API_KEY = 'AIzaSyBhbYzOh_B3snsiBlCEwI4DdUZbKJVHass'; // Replace with your YouTube API key

router.post('/', async (req, res) => {
  try {
    const { query } = req.body;
    const maxResults = 10;

    // Make a request to the YouTube Data API to search for videos
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        key: API_KEY,
        q: query,
        part: 'snippet',
        type: 'video',
        maxResults: maxResults,
      },
    });

    if (response.status !== 200) {
      throw new Error('Failed to fetch videos from YouTube API');
    }

    // Extract video data from the response
    const videoItems = response.data.items;

    // Extract video data without unnecessary fetchVideoDetails function
    const videos = videoItems.map((item) => {
      const videoId = item.id.videoId;
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

      return {
        videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnailUrl: item.snippet.thumbnails.high.url,
        videoUrl,
      };
    });

    // Send video URLs to the Python script
    const videoUrls = videos.map((video) => video.videoUrl);

    const { spawn } = require('child_process');

    // Run the Python script
    const pythonProcess = spawn('python', ['./audioConverter.py', ...videoUrls]);

    let pythonOutput = '';
    pythonProcess.stdout.on('data', (data) => {
      pythonOutput += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python script error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        console.log('Python script executed successfully');
        try {
          const audioUrls = JSON.parse(pythonOutput);
          // Return the audio URLs
          res.json({ videos, audioUrls });
        } catch (error) {
          console.error('Error parsing Python output:', error);
          res.status(500).json({ error: 'An error occurred while processing audio.' });
        }
      } else {
        console.error('Python script execution failed');
        res.status(500).json({ error: 'An error occurred while executing the Python script.' });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching videos.' });
  }
});

module.exports = router;