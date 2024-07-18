const { login, signup, googleSignup, googleLogin } = require('../Controllers/AuthController');
const { signupValidation, loginValidation } = require('../Middlewares/AuthValidation');
const { UserModel } = require('../Models/User');

const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

router.post('/login', loginValidation, login);
router.post('/signup', signupValidation, signup);
router.post('/googleSignup', googleSignup);
router.post('/googleLogin', googleLogin);

router.get('/login/success', (req, res) => {
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

router.get('/login/failed', (req, res) => {
  res.status(401).json({
    error: true,
    message: 'Login failure'
  });
});

router.put('/update', async (req, res) => {
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

router.delete('/delete', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await UserModel.findOneAndDelete({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = router;