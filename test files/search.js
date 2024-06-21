const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const apiKey = process.env.yt_key;
const youtube = google.youtube({
  version: 'v3',
  auth: apiKey,
});

function convertToJson(outDict) {
  fs.writeFileSync(path.join(__dirname, 'output_urls.json'), JSON.stringify(outDict, null, 2));
  console.log('Written in the JSON file');
}

function buildJson(videoTitle, videoUrl, thumbnail) {
  const mainProp = {};
  for (let i = 0; i < videoUrl.length; i++) {
    if (i < videoTitle.length && i < thumbnail.length) {
      const idx = `output${i}`;
      mainProp[idx] = { title: videoTitle[i], url: videoUrl[i], thumbnail: thumbnail[i] };
    } else {
      console.log('Some lists are shorter than others');
      continue;
    }
  }
  return mainProp;
}

async function fetchUrl(searchString) {
  try {
    const response = await youtube.search.list({
      q: searchString,
      type: 'video',
      part: 'id,snippet',
      maxResults: 50,
    });
    const videoUrl = [];
    const videoTitle = [];
    const thumbnail = [];
    response.data.items.forEach(item => {
      if (item.id.kind === 'youtube#video') {
        videoUrl.push(`https://www.youtube.com/watch?v=${item.id.videoId}`);
        videoTitle.push(item.snippet.title);
        thumbnail.push(item.snippet.thumbnails.high.url);
      } else {
        console.log("There's some error in fetching the results");
      }
    });
    const mainProp = buildJson(videoTitle, videoUrl, thumbnail);
    convertToJson(mainProp);
  } catch (err) {
    console.error('An error occurred while fetching results:', err);
  }
}

const searchString = process.argv[2] || 'bloomberg originals';
fetchUrl(searchString);