const {videoResults, channelFetch} = require('../Controllers/VideoController');
const router = require('express').Router();

router.get('/random-videos', videoResults);
router.get('/channel', channelFetch);

module.exports = router;