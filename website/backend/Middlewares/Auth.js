const jwt = require('jsonwebtoken');

const ensureAuthenticated = (req, res, next) => {
  const auth = req.headers['authorization'];
  if (!auth) {
    return res.status(403)
      .json({ message: 'Unazuthorized, JWT token is required' });
  }
  try {
    const detected = jwt.verify(auth, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401)
    .json({ message: 'Unazuthorized, JWT token is worng or expired' });
  }
}

module.exports = ensureAuthenticated;