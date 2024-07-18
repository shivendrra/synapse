const mongoose = require("mongoose");
const Joi = require("joi");

const songSchema = new mongoose.Schema({
	name: { type: String, required: true },
	artist: { type: String, required: true },
	videoId: { type: String, required: true },
	title: { type: String, required: true },
	channel: { type: String, required: true },
	thumbnailUrl: { type: String, required: true },
	description: { type: String, required: true },
	duration: { type: String, required: true },
});

const validate = (song) => {
	const schema = Joi.object({
		name: Joi.string().required(),
		artist: Joi.string().required(),
		videoId: Joi.string().required(),
		title: Joi.string().required(),
		channel: Joi.string().required(),
		thumbnailUrl: Joi.string().required(),
		description: Joi.string().required(),
		duration: Joi.string().required(),
	});
	return schema.validate(song);
};

const Song = mongoose.model("song", songSchema);

module.exports = { Song, validate };