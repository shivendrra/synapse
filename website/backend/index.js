const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
require('dotenv').config({ path: '.env' });
require('./Models/db');

const authRouter = require('./Routes/AuthRouter');
const videoRouter = require('./Routes/VideoRouter');

const allowedOrigins = [
  'http://localhost:3000',
  'https://synapse-music.vercel.app',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/auth', authRouter);
app.use('/content', videoRouter);

const API_KEY = process.env.yt_key;

app.get('/', (req, res) => {
  res.send('Welcome to the Synapse Music API');
});

app.post('/search', async (req, res) => {
  try {
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

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});