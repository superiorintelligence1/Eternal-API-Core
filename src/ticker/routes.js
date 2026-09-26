'use strict';
const express = require('express');
const db = require('../../config/database');

const router = express.Router();
const LUNO_BASE = 'https://api.luno.com/api/1';

// POST /ticker/:railId/refresh
// Pull a Luno ticker, store it against this rail.
router.post('/:railId/refresh', async function(req, res, next) {
  try {
    const railId = parseInt(req.params.railId, 10);
    if (!Number.isFinite(railId)) {
      return res.status(400).json({ ok: false, error: 'railId must be a number' });
    }

    const railCheck = await db.query('SELECT id, name FROM rails WHERE id = $1', [railId]);
    if (!railCheck.rows.length) {
      return res.status(404).json({ ok: false, error: 'rail not found' });
    }

    const pair = (req.body && req.body.pair) || 'XBTZAR';
    const url = LUNO_BASE + '/ticker?pair=' + encodeURIComponent(pair);

    const upstream = await fetch(url);
    if (!upstream.ok) {
      const text = await upstream.text();
      return res.status(502).json({
        ok: false,
        error: 'luno upstream ' + upstream.status,
        body: text.slice(0, 200)
      });
    }
    const data = await upstream.json();

    await db.query(
      'INSERT INTO ticker_log (rail_id, pair, bid, ask, last_trade, rolling_24h_volume, timestamp_ms) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [
        railId,
        data.pair || pair,
        data.bid || null,
        data.ask || null,
        data.last_trade || null,
        data.rolling_24_hour_volume || null,
        data.timestamp || null
      ]
    );

    res.json({
      ok: true,
      railId: railId,
      pair: data.pair || pair,
      bid: data.bid,
      ask: data.ask,
      last_trade: data.last_trade,
      fetched_at: new Date().toISOString()
    });
  } catch (e) {
    next(e);
  }
});

// GET /ticker/:railId/latest
router.get('/:railId/latest', async function(req, res, next) {
  try {
    const railId = parseInt(req.params.railId, 10);
    const rows = await db.query(
      'SELECT * FROM ticker_log WHERE rail_id = $1 ORDER BY id DESC LIMIT 1',
      [railId]
    );
    res.json({ ok: true, railId: railId, latest: rows.rows[0] || null });
  } catch (e) { next(e); }
});

// GET /ticker/:railId/history?limit=20
router.get('/:railId/history', async function(req, res, next) {
  try {
    const railId = parseInt(req.params.railId, 10);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const rows = await db.query(
      'SELECT * FROM ticker_log WHERE rail_id = $1 ORDER BY id DESC LIMIT ' + limit,
      [railId]
    );
    res.json({ ok: true, railId: railId, count: rows.rows.length, entries: rows.rows });
  } catch (e) { next(e); }
});

module.exports = router;
