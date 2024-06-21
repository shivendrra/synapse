const axios = require('axios');
const fluentFfmpeg = require('fluent-ffmpeg');

async function fetchVideoDetails(videoId) {
  // Fetch video details from the YouTube API
  // ...
}

async function convertVideoToAudio(videoId) {
  // Convert video to audio using fluent-ffmpeg
  // ...
}

module.exports = { fetchVideoDetails, convertVideoToAudio };
