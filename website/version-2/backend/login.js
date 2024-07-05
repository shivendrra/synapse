const express = require('express');
const { google } = require('googleapis');
const { MongoClient } = require('mongodb');
const router = express.Router();
require('dotenv').config({ path: '../../.env' });

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.SERVER_ROOT_URI}/oauth2callback`
);

// MongoDB connection URI and database name
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

router.get('/login', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes
  });

  res.redirect(url);
});

router.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2'
    });

    const userInfo = await oauth2.userinfo.get();
    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client
    });

    const response = await youtube.channels.list({
      mine: true,
      part: 'snippet,contentDetails,statistics'
    });

    const userData = {
      user: userInfo.data,
      channel: response.data.items[0]
    };

    // Connect to MongoDB and save the user data
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const database = client.db(dbName);
    const usersCollection = database.collection('users');

    // Upsert the user data (insert if new, update if existing)
    await usersCollection.updateOne(
      { 'user.id': userData.user.id },
      { $set: userData },
      { upsert: true }
    );

    await client.close();

    res.json(userData);
  } catch (error) {
    console.error(error);
    res.status(500).send('Authentication failed');
  }
});

module.exports = router;