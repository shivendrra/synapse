const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../Models/User');

const signup = async (req, res) => {
  try {
    const [ name, username, email, password] = req.body;
    const user = await UserModel.findOne({email});
    if (user) {
      return res.status(409)
        .json({ message: 'User already exist, try loging in', success: false });
    }
    const userModel = new UserModel({name, username, email, password});
    userModel.password = await bcrypt.hash(password, 10);
    await userModel.save();
    res.status(201)
      .json({ message: 'Signed up successfully', success: true });
  } catch {
    res.status(500)
      .json({ message: 'Internal Server Error', success: false });
  }
}

const login = async (req, res) => {
  try {
    const [ name, username, email, password] = req.body;
    const user = await UserModel.findOne({email});
    const errorMsg = 'Email or Password is worng';
    if (!user) {
      return res.status(403)
        .json({ message: errorMsg, success: false });
    }
    const isPass = await bcrypt.compare(password, user.password);
    if (!isPass){
      return res.status(403)
        .json({ message: errorMsg, success: false });
    }
    const jwtToken = jwt.sign({email: user.email, _id: user._id}, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(201)
      .json({ message: 'Logged in successfully', success: true, jwtToken, email, name: user.name, username: user.username });
  } catch {
    res.status(500)
      .json({ message: 'Internal Server Error', success: false });
  }
}

module.exports = {
  signup,
  login
}