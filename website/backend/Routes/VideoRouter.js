const ensureAuthenticated = require('../Middlewares/Auth');
const videoResults = require('../Controllers/VideoController');
const router = require('express').Router();

router.get('/', ensureAuthenticated, videoResults);

module.exports = router;