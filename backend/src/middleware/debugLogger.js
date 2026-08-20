const { DEBUG_REQUEST_LOGGING } = require('../utils/constants');

function debugLogger(req, res, next) {
  if (!DEBUG_REQUEST_LOGGING) return next();

  const start = Date.now();
  console.log(`--> ${req.method} ${req.originalUrl}`);
  console.log('Request headers:', req.headers);
  if (req.body && Object.keys(req.body).length) console.log('Request body:', req.body);

  let logged = false;
  function logResponse(body) {
    if (logged) return;
    logged = true;
    const ms = Date.now() - start;
    console.log(`<-- ${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
    console.log('Response body:', body);
  }

  const origJson = res.json;
  const origSend = res.send;

  res.json = function (body) {
    logResponse(body);
    return origJson.call(this, body);
  };

  res.send = function (body) {
    logResponse(body);
    return origSend.call(this, body);
  };

  next();
}

module.exports = debugLogger;
