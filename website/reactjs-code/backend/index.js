const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.post('/search', async (req, res) => {
  try {
    const API_KEY = 'AIzaSyBhbYzOh_B3snsiBlCEwI4DdUZbKJVHass'; // Replace with your actual YouTube API key
    const { query } = req.body;
    const maxResults = 10; // Set the number of results you want

    // Make a request to the YouTube Data API to search for videos
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        key: API_KEY,
        q: query,
        part: 'snippet',
        type: 'video',
        maxResults: maxResults, // Set the desired number of results
      },
    });

    // Check if the response is successful (status code 200)
    if (response.status === 200) {
      // Extract video data from the response
      const videos = response.data.items.map((item) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnailUrl: item.snippet.thumbnails.high.url,
      }));

      res.json(videos);
    } else {
      // Handle the case when the API response is not successful
      res.status(response.status).send('Error fetching videos');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching videos');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
