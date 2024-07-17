const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  avatarConfig: String,
  playlists: [{
    name: String,
    songs: [{
      videoId: String,
      title: String,
      channel: String,
      thumbnailUrl: String,
      description: String,
    }],
  }],
});

const playlistModel = mongoose.model('Playlist', playlistSchema);
module.exports = playlistModel;