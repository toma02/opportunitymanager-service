const pool = require('../db');

const addToFavorites = async (userId, opportunityId) => {
  const sql = `
    INSERT INTO userfavorites (userid, opportunityid)
    VALUES ($1, $2)
    ON CONFLICT (userid, opportunityid) DO NOTHING
    RETURNING *;
  `;
  const result = await pool.query(sql, [userId, opportunityId]);
  return result.rows[0];
};

const removeFromFavorites = async (userId, opportunityId) => {
  const sql = `
    DELETE FROM userfavorites
    WHERE userid = $1 AND opportunityid = $2
    RETURNING *;
  `;
  const result = await pool.query(sql, [userId, opportunityId]);
  return result.rows[0];
};

const getUserFavorites = async (userId) => {
  const sql = `
    SELECT v.*
    FROM userfavorites f
    JOIN volunteeropportunity v ON f.opportunityid = v.opportunityid
    WHERE f.userid = $1;
  `;
  const result = await pool.query(sql, [userId]);
  return result.rows;
};

module.exports = {
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
};
