require('dotenv').config({ path: '.env' });
const axios = require('axios');

const videoResults = async (req, res) => {
  try {
    const maxResults = 24;
    const videoCategoryId = req.query.category || '10';
    const api_key = process.env.yt_key
    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        key: api_key,
        part: 'snippet',
        chart: 'mostPopular',
        maxResults: maxResults,
        regionCode: 'IN',
        videoCategoryId: videoCategoryId,
      },
    });
    if (response.status === 200) {
      const videos = response.data.items.map((item) => ({
        videoId: item.id,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnailUrl: item.snippet.thumbnails.medium.url,
        description: item.snippet.description,
      }));

      res.json(videos);
    } else {
      res.status(response.status).send('Error fetching random videos');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching random videos');
  }
}

module.exports = videoResults;