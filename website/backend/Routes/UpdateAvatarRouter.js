const express = require('express');
const UserModel = require('../Models/User');
const router = express.Router();

router.post('/update-avatar', async (req, res) => {
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

module.exports = router;