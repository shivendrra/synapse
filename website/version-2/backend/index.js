const express = require('express');
const cors = require('cors');
const axios = require('axios');
const loginRouter = require('./login');
const { MongoClient } = require('mongodb');
const app = express();
require('dotenv').config({ path: '.env' });

const allowedOrigins = [
  'http://192.168.29.198:3000',
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

app.use('/auth', loginRouter);

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;
const API_KEY = process.env.yt_key;

app.get('/random-videos', async (req, res) => {
  try {
    const maxResults = 20;
    const videoCategoryId = req.query.category || '10'; // Default to Music category

    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        key: API_KEY,
        part: 'snippet',
        chart: 'mostPopular',
        maxResults: maxResults,
        regionCode: 'IN',
        videoCategoryId: videoCategoryId,
      },
    });

    if (response.status === 200) {
      const videos = response.data.items.map((item) => ({
        videoId: item.id,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnailUrl: item.snippet.thumbnails.medium.url,
        description: item.snippet.description,
      }));

      res.json(videos);
    } else {
      res.status(response.status).send('Error fetching random videos');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching random videos');
  }
});

app.post('/save-user', async (req, res) => {
  const { name, username, email, password } = req.body;

  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const database = client.db(dbName);
    const usersCollection = database.collection('users');

    await usersCollection.insertOne({ name, username, email, password });

    await client.close();

    res.status(200).send('User data saved successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error saving user data');
  }
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
  console.log('Server is running');
});