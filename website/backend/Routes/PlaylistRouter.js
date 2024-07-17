const express = require('express');
const playlistModel = require('../Models/Playlist');
const router = express.Router();

router.post('/add-playlist', async (req, res) => {
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

router.get('/get-playlists/:username', async (req, res) => {
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

module.exports = router;