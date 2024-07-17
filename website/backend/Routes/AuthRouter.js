
const { login, signup, googleSignup, googleLogin } = require('../controllers/AuthController');
const { signupValidation, loginValidation } = require('../Middlewares/AuthValidation');

const express = require('express');
const router = express.Router();
const passport = require('passport');

router.post('/login', loginValidation, login);
router.post('/signup', signupValidation, signup);
router.post('/googleSignup', googleSignup);
router.post('/googleLogin', googleLogin);

router.get('/login/success', (req, res) => {
  if (req.user) {
    res.status(200).json({
      error: false,
      message: "Successfully logged in",
      user: req.user,
    })
  } else {
    res.status(403).json({ error: true, message: "Not Authorized" });
  }
});

router.get('/login/failed', (req, res) => {
  res.status(401).json({
    error: true,
    message: 'Login failure'
  });
});

router.get('/google/callback',
  passport.authenticate("google", {
    sucessRedirect: 'http://localhost:3000/',
    failureRedirect: '/login/failed',
  })
);

router.get("/google", passport.authenticate("google", ["profile", "email"]));
router.get("/logout", (req, res) => {
  req.logout();
  req.redirect('http://localhost:3000');
});

module.exports = router;