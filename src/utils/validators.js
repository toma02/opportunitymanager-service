const Messages = require('../enums/messages.enum');

exports.validateParam = (param, res, name, status = 400) => {
  if (!param) {
    res.status(status).json({ error: Messages[`${name}_REQUIRED`] });
    return true;
  }
  return false;
};