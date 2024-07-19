require('dotenv').config({ path: '.env' });
const axios = require('axios');
const API_KEY = process.env.YT_KEY;

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

const channelFetch = async (req, res) => {
  try {
    const { channelId } = req.body;
    console.log("channel id: ", channelId);

    const channelResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      params: {
        key: API_KEY,
        id: channelId,
        part: 'snippet,contentDetails,statistics',
      },
    });
    if (channelResponse.status !== 200) {
      return res.status(channelResponse.status).send('Error fetching channel details');
    }
    const channelData = channelResponse.data.items[0];
    const uploadsPlaylistId = channelData.contentDetails.relatedPlaylists.uploads;
    let videos = [];
    let nextPageToken = '';

    do {
      const videosResponse = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
        params: {
          key: API_KEY,
          playlistId: uploadsPlaylistId,
          part: 'snippet',
          maxResults: 50,
          pageToken: nextPageToken,
        },
      });
      if (videosResponse.status !== 200) {
        return res.status(videosResponse.status).send('Error fetching videos');
      }
      videos = videos.concat(videosResponse.data.items);
      nextPageToken = videosResponse.data.nextPageToken;
    } while (nextPageToken);

    const formattedVideos = videos.map((item) => ({
      videoId: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnailUrl: item.snippet.thumbnails.medium.url,
      description: item.snippet.description,
    }));

    res.json({ channel: channelData.snippet, videos: formattedVideos });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching channel information');
  }
}

module.exports = { videoResults, channelFetch };