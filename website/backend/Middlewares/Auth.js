const jwt = require('jsonwebtoken');

const ensureAuthenticated = (req, res, next) => {
  const auth = req.headers['authorization'];
  console.log(auth);
  if (!auth) {
    return res.status(403).json({ message: 'Unauthorized, JWT token is required' });
  }
  try {
    const decoded = jwt.verify(auth, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized, JWT token is wrong or expired' });
  }
}

module.exports = ensureAuthenticated;