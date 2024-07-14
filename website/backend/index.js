const fs = require('fs');
const path = require('path');

console.log('Current directory:', __dirname);
console.log('Files in Models directory:', fs.readdirSync(path.join(__dirname, 'Models')));

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
require('events').EventEmitter.defaultMaxListeners = 15;
require('dotenv').config({ path: '.env' });

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
    required: true,
  }
});

const UserModel = mongoose.model('user', UserSchema);
const app = express();
const mongo_url = process.env.MONGODB_URL;
const API_KEY = process.env.yt_key;

mongoose.connect(mongo_url)
  .then(() => {
    console.log("Database connected...");
  }).catch((err) => {
    console.log("Database has some error: " + err);
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

app.use(cors(corsOptions));
app.use(express.json());

// Auth Router and Controller
const authRouter = express.Router();

const signupValidation = (req, res, next) => {
  const Schema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    email: Joi.string().email().required(),
    username: Joi.string().min(3).max(15).required(),
    password: Joi.string().min(4).max(20).required(),
  });
  const { error } = Schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "Bad request", error });
  }
  next();
};

const loginValidation = (req, res, next) => {
  const Schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(4).max(20).required(),
  });
  const { error } = Schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "Bad request", error });
  }
  next();
};

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
    res.status(201).json({ message: 'Signed up successfully', success: true });
  } catch (error) {
    console.error(error);
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
    res.status(200).json({ message: 'Logged in successfully', success: true, jwtToken, email, name: user.name, username: user.username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
};

authRouter.post('/signup', signupValidation, signup);
authRouter.post('/login', loginValidation, login);

app.use('/auth', authRouter);

// Video Router and Controller
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

app.use('/content', videoRouter);

// General Routes
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

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;