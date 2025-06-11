const pool = require('../db');

const getAllById = async (eventId, userId) => {
  const sql = `
    SELECT 
      c.*, 
      u.username, 
      up.filename AS avatar,
      vo.useridoforganisator AS organizer_id,
      (NOW() - u.lastlogin <= interval '1 hours') AS recently_active,
      ${userId ? `EXISTS(
        SELECT 1 FROM commentlikes cl 
        WHERE cl.commentid = c.commentid AND cl.userid = $2
      ) AS is_liked` : 'false AS is_liked'}
    FROM comments c
    JOIN "User" u ON c.userid = u.userid
    LEFT JOIN userprofile up ON u.userid = up.userid
    JOIN VolunteerOpportunity vo ON c.opportunityid = vo.opportunityid
    WHERE c.opportunityid = $1
    ORDER BY c.createat ASC
  `;
  const params = userId ? [eventId, userId] : [eventId];
  const result = await pool.query(sql, params);
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

const deleteComment = async (commentId) => {
  const sql = `
    DELETE FROM comments
    WHERE commentid = $1
    RETURNING *;
  `;
  const result = await pool.query(sql, [commentId]);
  return result.rows[0];
};

const likeComment = async (commentId, userId) => {
  await pool.query('BEGIN');
  await pool.query(
    'INSERT INTO commentlikes (commentid, userid) VALUES ($1, $2)',
    [commentId, userId]
  );
  await pool.query(
    'UPDATE comments SET likecount = likecount + 1 WHERE commentid = $1',
    [commentId]
  );
  await pool.query('COMMIT');
  return { success: true };
};

const unlikeComment = async (commentId, userId) => {
  await pool.query('BEGIN');
  await pool.query(
    'DELETE FROM commentlikes WHERE commentid = $1 AND userid = $2',
    [commentId, userId]
  );
  await pool.query(
    'UPDATE comments SET likecount = likecount - 1 WHERE commentid = $1',
    [commentId]
  );
  await pool.query('COMMIT');
  return { success: true };
};

module.exports = {
  getAllById,
  addComment,
  deleteComment,
  likeComment,
  unlikeComment
};
