const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { authenticate, requireOperator } = require('../auth/routes');
const { EternalError } = require('../utils/errors');

// POST /whitelist — add caller
router.post('/', authenticate, requireOperator, async (req, res, next) => {
  try {
    const { caller, rail } = req.body;

    if (!caller || !rail) {
      throw new EternalError('caller and rail are required', 400);
    }

    const result = await db.query(
      `INSERT INTO whitelist (caller, rail)
       VALUES ($1, $2)
       RETURNING *`,
      [caller, rail]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// GET /whitelist — list all
router.get('/', authenticate, requireOperator, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT * FROM whitelist ORDER BY id ASC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// DELETE /whitelist/:id — remove caller
router.delete('/:id', authenticate, requireOperator, async (req, res, next) => {
  try {
    const { id } = req.params;

    await db.query(
      `DELETE FROM whitelist WHERE id = $1`,
      [id]
    );

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// POST /whitelist/check — verify access
router.post('/check', authenticate, async (req, res, next) => {
  try {
    const { caller, rail } = req.body;

    const result = await db.query(
      `SELECT * FROM whitelist
       WHERE caller = $1 AND rail = $2`,
      [caller, rail]
    );

    res.json({ allowed: result.rows.length > 0 });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
