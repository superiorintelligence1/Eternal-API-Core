const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'eternal-dev-secret-change-me';

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }
  try {
    const payload = jwt.verify(parts[1], SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

module.exports = { requireAuth: requireAuth, signToken: signToken };

