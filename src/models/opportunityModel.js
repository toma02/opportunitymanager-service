const pool = require('../db');

const getAll = async () => {
  const result = await pool.query('SELECT * FROM volunteeropportunity');
  return result.rows;
};

module.exports = {
  getAll,
};
