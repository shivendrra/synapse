const videoResults = require('../Controllers/VideoController');
const router = require('express').Router();

router.get('/random-videos', videoResults);

module.exports = router;