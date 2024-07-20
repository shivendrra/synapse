const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const { UserModel } = require('../Models/User');
const jwt = require('jsonwebtoken');

const oauth2Client = new OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URI
);

const scopes = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes
  });
}

async function handleYoutubeCallback(req, res) {
  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2'
    });

    const { data: userInfo } = await oauth2.userinfo.get();
    const { email, name } = userInfo;

    let user = await UserModel.findOne({ email });
    if (!user) {
      const username = generateFromEmail(email, 4);
      user = new UserModel({ name, username, email });
      await user.save();
    }

    const jwtToken = jwt.sign({ email: user.email, _id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.redirect(`/login/success?token=${jwtToken}&userId=${user._id}&email=${email}&name=${name}&username=${user.username}`);
  } catch (error) {
    console.error('Error handling YouTube callback:', error);
    res.redirect('/login/failed');
  }
}

module.exports = {
  getAuthUrl,
  handleYoutubeCallback
};