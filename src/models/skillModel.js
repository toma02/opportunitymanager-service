const pool = require('../db');

const getAll = async () => {
  const sql = `
    SELECT * FROM skill
    ORDER BY name;
  `;
  const result = await pool.query(sql);
  return result.rows;
};

module.exports = {
  getAll
};