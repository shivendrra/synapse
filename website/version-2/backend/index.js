const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 3001;
require('dotenv').config({path:'../../.env'});

app.use(cors());
app.use(express.json());

app.post('/search', async (req, res) => {
  try {
    const API_KEY = process.env.yt_key;
    const { query } = req.body;
    const maxResults = 10;

    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        key: API_KEY,
        q: query,
        part: 'snippet',
        type: 'video',
        maxResults: maxResults,
      },
    });

    if (response.status === 200) {
      const videos = response.data.items.map((item) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnailUrl: item.snippet.thumbnails.medium.url,
        description: item.snippet.description,
      }));

      res.json(videos);
    } else {
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