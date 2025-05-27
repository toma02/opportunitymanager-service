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


const addComment = async ({ opportunityid, userid, comment }) => {
  const sql = `
    INSERT INTO comments (opportunityid, userid, comment, createat, likecount)
    VALUES ($1, $2, $3, NOW(), 0)
    RETURNING *;
  `;
  const result = await pool.query(sql, [opportunityid, userid, comment]);
  return result.rows[0];
};

module.exports = {
  getAllById,
  addComment
};
