const express = require('express');
const { signToken } = require('./middleware');

const router = express.Router();

router.post('/login', function(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }
  // Placeholder check — replace with real DB lookup later
  if (username === 'don' && password === 'eternal') {
    const token = signToken({ username: username, role: 'operator' });
    return res.json({ ok: true, token: token, username: username });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

module.exports = router;

