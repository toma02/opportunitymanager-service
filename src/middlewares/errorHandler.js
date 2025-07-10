const Messages = require('../enums/messages.enum');

module.exports = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || Messages.INTERNAL_SERVER_ERROR;
  res.status(status).json({ error: message });
};