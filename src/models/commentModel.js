const pool = require('../db');

const getAllById = async (eventId) => {
  const sql = `
    SELECT 
      c.*, 
      u.username 
    FROM comments c
    JOIN "User" u ON c.userid = u.userid
    WHERE c.opportunityid = $1
    ORDER BY c.createat ASC
  `;
  const result = await pool.query(sql, [eventId]);
  return result.rows;
};


module.exports = {
  getAllById
};
