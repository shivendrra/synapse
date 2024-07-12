const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../Models/User');
require('dotenv').config({ path: '.env' });

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

module.exports = {
  signup,
  login,
};