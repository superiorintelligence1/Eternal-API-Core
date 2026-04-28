const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { authenticate, requireOperator } = require('../auth/routes');
const { EternalError } = require('../utils/errors');

// POST /rails — create a rail
router.post('/', authenticate, requireOperator, async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      throw new EternalError('Rail name is required', 400);
    }

    const result = await db.query(
      `INSERT INTO rails (name, description, status)
       VALUES ($1, $2, 'INACTIVE')
       RETURNING *`,
      [name, description || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// GET /rails — list all rails
router.get('/', authenticate, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT * FROM rails ORDER BY id ASC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// PATCH /rails/:id — update rail
router.patch('/:id', authenticate, requireOperator, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const result = await db.query(
      `UPDATE rails
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [name || null, description || null, status || null, id]
    );

    if (result.rows.length === 0) {
      throw new EternalError('Rail not found', 404);
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /rails/:id — remove rail
router.delete('/:id', authenticate, requireOperator, async (req, res, next) => {
  try {
    const { id } = req.params;

    await db.query(
      `DELETE FROM rails WHERE id = $1`,
      [id]
    );

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;

