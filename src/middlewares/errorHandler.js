module.exports = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Greška na serveru.';
    res.status(status).json({ error: message });
  };
  