const express = require('express');
const auth = require('./auth/routes');
const railsRouter = require('./rails/routes');
const whitelistRouter = require('./whitelist/routes');
const tickerRouter = require('./ticker/routes');

const app = express();
app.use(express.json());

app.get('/health', function(req, res) {
  res.json({ status: 'ok', service: 'eternal-api-core', version: '1.0' });
});

app.use('/auth', auth.router);
app.use('/rails', railsRouter);
app.use('/whitelist', whitelistRouter);
app.use('/ticker', tickerRouter);

app.use(function(err, req, res, next) {
  const status = err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Internal error' });
});

const PORT = process.env.PORT || 5061;
app.listen(PORT, function() {
  console.log('[eternal-api-core] listening on ' + PORT);
});
