const router = require('express').Router();
const { Playlist, validate } = require('../Models/Playlist');
const { Song } = require("../Models/Songs");
const { UserModel } = require('../Models/User');
const Joi = require("joi");
const auth = require("../Middlewares/Auth");
const validObjectId = require("../Middlewares/ValidObjectId");

// Creating a playlist
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { email } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const playlist = await Playlist({ ...req.body, user: user._id }).save();
  user.playlists.push(playlist._id);
  await user.save();

  res.status(200).json({ data: playlist });
});

router.post("/edit/:id", [validObjectId, auth], async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().object(),
    desc: Joi.string().allow(""),
    img: Joi.string().allow(""),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) return res.status(404).json({ message: "Playlist not Found!" });
  const user = await UserModel.findOne(req.user._id);
  if (!user._id.equals(playlist.user))
    return res.status(403).json({ message: "User doesn't have access to edit!" });

  playlist.name = req.body.name;
  playlist.desc = req.body.desc;
  playlist.img = req.body.img;
  await playlist.save();

  res.status(200).json({ message: "Updated successfully" });
});

router.put("/add-song", auth, async (req, res) => {
  const schema = Joi.object({
    playlistId: Joi.string().required(),
    song: Joi.object({
      videoId: Joi.string().required(),
      title: Joi.string().required(),
      channel: Joi.string().required(),
      thumbnailUrl: Joi.string().required(),
      description: Joi.string().required(),
    }).required()
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const user = await UserModel.findById(req.user._id);
  const playlist = await Playlist.findById(req.body.playlistId);
  if (!user._id.equals(playlist.user))
    return res.status(403).json({ message: "User doesn't have access to add!" });

  if (!playlist.songs.find(song => song.videoId === req.body.song.videoId)) {
    playlist.songs.push(req.body.song);
  }
  await playlist.save();
  res.status(200).json({ data: playlist, message: "Added to playlist" });
});

router.put("/remove-song", auth, async (req, res) => {
  const schema = Joi.object({
    playlistId: Joi.string().required(),
    videoId: Joi.string().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const user = await UserModel.findById(req.user._id);
  const playlist = await Playlist.findById(req.body.playlistId);
  if (!user._id.equals(playlist.user))
    return res
      .status(403)
      .json({ message: "User doesn't have access to Remove!" });

  playlist.songs = playlist.songs.filter(song => song.videoId !== req.body.videoId);
  await playlist.save();
  res.status(200).json({ data: playlist, message: "Removed from playlist" });
});

// user playlists
router.get("/favourite", auth, async (req, res) => {
  const user = await UserModel.findById(req.user._id);
  const playlists = await Playlist.find({ _id: user.playlists });
  res.status(200).json({ data: playlists });
});

// get random playlists
router.get("/random", auth, async (req, res) => {
  const playlists = await Playlist.aggregate([{ $sample: { size: 10 } }]);
  res.status(200).json({ data: playlists });
});

// get playlist by id
router.get("/:id", [validObjectId, auth], async (req, res) => {
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) return res.status(404).json("not found");

  const songs = await Song.find({ _id: playlist.songs });
  res.status(200).json({ data: { playlist, songs } });
});

// get all playlists
router.get("/", auth, async (req, res) => {
  const playlists = await Playlist.find();
  res.status(200).json({ data: playlists });
});

// delete playlist by id
router.delete("/:id", [validObjectId, auth], async (req, res) => {
  const user = await UserModel.findById(req.user._id);
  const playlist = await Playlist.findById(req.params.id);
  if (!user._id.equals(playlist.user))
    return res
      .status(403)
      .json({ message: "User doesn't have access to delete!" });

  const index = user.playlists.indexOf(req.params.id);
  user.playlists.splice(index, 1);
  await user.save();
  await playlist.remove();
  res.status(200).json({ message: "Removed from library" });
});

module.exports = router;