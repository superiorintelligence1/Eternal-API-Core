const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'eternal-dev-secret-change-me';
const OPERATOR_KEY = process.env.OPERATOR_KEY || 'eternal-operator-key';

// POST /auth/token - issue a token (dev helper)
router.post('/token', function(req, res) {
  const role = (req.body && req.body.role) || 'operator';
  const token = jwt.sign({ sub: 'operator', role: role }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token: token, role: role });
});

function authenticate(req, res, next) {
  const opKey = req.header('X-Operator-Key');
  if (opKey && opKey === OPERATOR_KEY) {
    req.user = { sub: 'operator', role: 'operator' };
    return next();
  }
  const auth = req.header('Authorization');
  if (!auth || auth.indexOf('Bearer ') !== 0) {
    return res.status(401).json({ error: 'Missing authorization' });
  }
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function requireOperator(req, res, next) {
  if (!req.user || req.user.role !== 'operator') {
    return res.status(403).json({ error: 'Operator role required' });
  }
  next();
}

module.exports = { router: router, authenticate: authenticate, requireOperator: requireOperator };
