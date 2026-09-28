const express = require('express');
const auth = require('./auth/routes');
const loginRouter = require('./auth/login');
const { requireAuth } = require('./auth/middleware');
const railsRouter = require('./rails/routes');
const whitelistRouter = require('./whitelist/routes');
const tickerRouter = require('./ticker/routes');
const vaultsRouter = require('./vaults/routes');

const app = express();
app.use(express.json());

app.get('/health', function(req, res) {
  res.json({ status: 'ok', service: 'eternal-api-core', version: '1.0' });
});

app.use('/auth', loginRouter);
app.use('/auth', auth.router);
app.use('/rails', railsRouter);
app.use('/whitelist', whitelistRouter);
app.use('/ticker', tickerRouter);
app.use('/vaults', requireAuth, vaultsRouter);  // 🔒 now protected
app.use(require('express').static(require('path').join(__dirname, '..', 'public')));

app.use(function(err, req, res, next) {
  const status = err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Internal error' });
});

const PORT = process.env.PORT || 8080;
const fs = require('node:fs');
const path = require('node:path');
const dbPath = path.join(__dirname, '..', 'eternal.db');
if (!fs.existsSync(dbPath)) {
  console.log('[eternal-api-core] First run — loading vaults...');
  require('./vaults/loader.js');
}


app.listen(PORT, function() {
  console.log('[eternal-api-core] listening on ' + PORT);
});

