const mongoose = require('mongoose');
const Joi = require("joi");
const { v4: uuidv4 } = require('uuid');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  userId: {
    type: String,
    unique: true,
    default: uuidv4,
    immutable: true,
  },
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
  },
  avatar: {
    type: String,
  },
  gender: { 
    type: String, 
    required: true 
  },
  playlists: { 
    type: [String], 
    default: [] 
  },
});

const validate = (user) => {
  const schema = Joi.object({
    name: Joi.string().min(5).max(10).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(4).max(20).required(),
    gender: Joi.string().valid("male", "female", "non-binary").required(),
  });
  return schema.validate(user);
};

const UserModel = mongoose.model('user', UserSchema);
module.exports = { UserModel, validate };