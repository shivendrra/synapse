const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ytdl = require('@distube/ytdl-core');
const Joi = require('joi');
const { generateFromEmail } = require("unique-username-generator");

require('events').EventEmitter.defaultMaxListeners = 15;
require('dotenv').config({ path: '.env' });

const mongo_url = process.env.MONGODB_URL;
const API_KEY = process.env.yt_key;

const Schema = mongoose.Schema;
const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  avatar: {
    type: String,
  },
  gender: { type: String, required: true },
  month: { type: String, required: true },
  date: { type: String, required: true },
  year: { type: String, required: true },
  likedSongs: { type: [String], default: [] },
  playlists: { type: [String], default: [] },
  isAdmin: { type: Boolean, default: false },
});

const UserModel = mongoose.models.user || mongoose.model('user', UserSchema);

mongoose.connect(mongo_url, {
  serverSelectionTimeoutMS: 5000
})
  .then(() => {
    console.log("Database connected...");
  }).catch((err) => {
    console.error("Database connection error: " + err);
  });

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

const app = express();
app.use(cors(corsOptions));
app.use(express.json());

const authRouter = express.Router();

const signupValidation = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    email: Joi.string().email().required(),
    username: Joi.string().min(3).max(15).required(),
    password: Joi.string().min(4).max(20).required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "Bad request", error });
  }
  next();
}

const loginValidation = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(4).max(20).required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "Bad request", error });
  }
  next();
}

const signup = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (user) {
      return res.status(409).json({ message: 'User already exists, try logging in', success: false });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userModel = new UserModel({ name, username, email, password: hashedPassword });
    await userModel.save();
    res.status(201).json({ message: 'Signed up successfully', success: true, userId: userModel._id });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    const errorMsg = 'Email or Password is wrong';
    if (!user) {
      return res.status(403).json({ message: errorMsg, success: false });
    }
    const isPass = await bcrypt.compare(password, user.password);
    if (!isPass) {
      return res.status(403).json({ message: errorMsg, success: false });
    }
    const jwtToken = jwt.sign({ email: user.email, _id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({ message: 'Logged in successfully', success: true, jwtToken, userId: user._id, email, name: user.name, username: user.username });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
};

const googleSignup = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await UserModel.findOne({ email });
    if (user) {
      return res.status(409).json({ message: 'User already exists, try logging in', success: false });
    }
    const username = generateFromEmail(email, 4);
    const userModel = new UserModel({ name, username, email });
    await userModel.save();
    res.status(201).json({ message: 'Signed up successfully using Google', success: true, userId: userModel._id });
  } catch (error) {
    console.error('Google Signup Error:', error);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });
    const errorMsg = "User doesn't exist, try signing up";
    if (!user) {
      return res.status(403).json({ message: errorMsg, success: false });
    }
    const jwtToken = jwt.sign({ email: user.email, _id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({ message: 'Logged in successfully', success: true, jwtToken, userId: user._id, email, name: user.name, username: user.username });
  } catch (error) {
    console.error('Google Login Error:', error);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
};

authRouter.post('/login', loginValidation, login);
authRouter.post('/signup', signupValidation, signup);
authRouter.post('/googleSignup', googleSignup);
authRouter.post('/googleLogin', googleLogin);

authRouter.get('/login/success', (req, res) => {
  if (req.user) {
    res.status(200).json({
      error: false,
      message: "Successfully logged in",
      user: req.user,
    });
  } else {
    res.status(403).json({ error: true, message: "Not Authorized" });
  }
});

authRouter.get('/login/failed', (req, res) => {
  res.status(401).json({
    error: true,
    message: 'Login failure'
  });
});

authRouter.put('/update', async (req, res) => {
  try {
    const { userId, userN, name, email, gender, password } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    const username = userN;
    const updateData = { name, username, email, gender };
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }
    const updatedUser = await UserModel.findOneAndUpdate({ _id: userId }, updateData, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

authRouter.delete('/delete', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await UserModel.findOneAndDelete({ _id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});


authRouter.get("/logout", (req, res) => {
  req.logout();
  // res.redirect('http://localhost:3000');
  res.redirect('https://synapse-music.vercel.app');
});

const updateAvatarRouter = express.Router();

updateAvatarRouter.post('/update-avatar', async (req, res) => {
  const { username, avatarConfig } = req.body;

  try {
    const user = await UserModel.findOneAndUpdate({ username }, { avatarConfig }, { new: true });
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

const playlistRouter = express.Router();

playlistRouter.post('/add-playlist', async (req, res) => {
  const { username, playlistName, song } = req.body;

  try {
    let user = await playlistModel.findOne({ username });

    if (!user) {
      user = new playlistModel({ username, playlists: [] });
    }

    const playlist = user.playlists.find(p => p.name === playlistName);
    if (playlist) {
      playlist.songs.push(song);
    } else {
      user.playlists.push({ name: playlistName, songs: [song] });
    }

    await user.save();
    res.json({ success: true, user });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error', error });
  }
});

playlistRouter.get('/get-playlists/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const user = await playlistModel.findOne({ username });

    if (user) {
      res.json({ success: true, playlists: user.playlists });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }

  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error', error });
  }
});

const videoRouter = express.Router();

const videoResults = async (req, res) => {
  try {
    const maxResults = 24;
    const videoCategoryId = req.query.category || '10';
    const api_key = process.env.yt_key
    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        key: api_key,
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
};

videoRouter.get('/random-videos', videoResults);

app.use('/auth', authRouter);
app.use('/playlists', playlistRouter);
app.use('/content', videoRouter);
app.use('/api', updateAvatarRouter);

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
      return res.status(400).json({ error: 'Invalid URL' });
    }

    const videoInfo = await ytdl.getInfo(videoUrl);
    const videoTitle = videoInfo.videoDetails.title;
    const sanitizedTitle = videoTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const downloadDir = path.resolve(__dirname, 'downloads');
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir);
    }
    const filePath = path.resolve(downloadDir, `${sanitizedTitle}.mp3`);

    const audioStream = ytdl(videoUrl, {
      filter: 'audioonly',
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      },
    });
    const output = fs.createWriteStream(filePath);
    audioStream.pipe(output);
    output.on('finish', () => {
      res.download(filePath, `${sanitizedTitle}.mp3`, (err) => {
        if (err) {
          console.error('Error sending file:', err);
          res.status(500).send('Error sending file');
        } else {
          console.log(`File sent: ${filePath}`);
          fs.unlinkSync(filePath);
        }
      });
    });

    req.on('close', () => {
      if (!res.headersSent) {
        res.status(499).send('Client closed request');
      }
      audioStream.destroy();
      output.end();
    });

    audioStream.on('error', (err) => {
      console.error('Error downloading video:', err);
      res.status(500).send('Error downloading video');
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;