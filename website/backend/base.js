const express = require('express');
const cors = require('cors');
const axios = require('axios');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');
const app = express();
require('dotenv').config({ path: '.env' });
require('./Models/db');

const authRouter = require('./Routes/AuthRouter');
const videoRouter = require('./Routes/VideoRouter');
const cookieSession = require('cookie-session');
const passport = require('passport');
const passportSetup = require('./passport');

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

app.use(
  cookieSession({
    name: "session",
    keys: ['cyberwolve'],
    maxAge: 24*60*60*100,
  })
);

app.use(passport.initialize());
app.use(passport.session());

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

app.get('/download', async (req, res) => {
  try {
    const videoId = req.query.id;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    if (!ytdl.validateURL(videoUrl)) {
      console.log('invalid url');
      return res.status(400).json({ error: 'Invalid URL' });
    }

    const videoInfo = await ytdl.getInfo(videoUrl);
    const videoTitle = videoInfo.videoDetails.title;
    const sanitizedTitle = videoTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const downloadDir = path.resolve(__dirname, 'downloads');
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir);
    }
    const filePath = path.resolve(__dirname, 'downloads', `${sanitizedTitle}.mp3`);
    
    const output = fs.createWriteStream(filePath);
    ytdl(videoUrl, { format: 'mp3', filter: 'audioonly' })
      .pipe(output)
      .on('finish', () => {
        console.log('Download completed!');
        res.download(filePath, `${sanitizedTitle}.mp3`, (err) => {
          if (err) {
            console.error('Error sending file:', err);
            res.status(500).send('Error sending file');
          }
          fs.unlinkSync(filePath);
        });
      })
      .on('error', (err) => {
        console.error('Error downloading video:', err);
        res.status(500).send('Error downloading video');
      });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});