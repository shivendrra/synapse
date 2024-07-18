const mongoose = require('mongoose');
const Joi = require('joi');

const objectID = mongoose.Schema.Types.ObjectId;
const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  user: {
    type: objectID,
    ref: "user",
    required: true
  },
  desc: {
    type: String
  },
  songs: [{
    videoId: String,
    title: String,
    channel: String,
    thumbnailUrl: String,
    description: String,
  }],
  img: {
    type: String
  }
});

const validate = (playlist) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    user: Joi.string().required(),
    desc: Joi.string().allow(""),
    songs: Joi.array().items(Joi.object({
      videoId: Joi.string().required(),
      title: Joi.string().required(),
      channel: Joi.string().required(),
      thumbnailUrl: Joi.string().required(),
      description: Joi.string().required(),
    })),
    img: Joi.string().allow(""),
  });
  return schema.validate(playlist);
}

const Playlist = mongoose.model("playlist", playlistSchema);
module.exports = { Playlist, validate };