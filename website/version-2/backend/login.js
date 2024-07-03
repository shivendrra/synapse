const express = require('express');
const { google } = require('googleapis');
const router = express.Router();
require('dotenv').config({ path: '../../.env' });

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.SERVER_ROOT_URI}/oauth2callback`
);

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
    
    res.json({
      user: userInfo.data,
      channel: response.data.items[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Authentication failed');
  }
});

module.exports = router;