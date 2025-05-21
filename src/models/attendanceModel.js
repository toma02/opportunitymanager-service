const pool = require('../db');

const addAttendance = async (eventId, userId) => {
  const checkSql = `
    SELECT * FROM Attendance 
    WHERE opportunityid = $1 AND userid = $2
  `;
  const check = await pool.query(checkSql, [eventId, userId]);
  if (check.rows.length > 0) {
    const updateSql = `
      UPDATE Attendance 
      SET attended = true 
      WHERE opportunityid = $1 AND userid = $2
      RETURNING *
    `;
    const result = await pool.query(updateSql, [eventId, userId]);
    return result.rows[0];
  } else {

    const insertSql = `
      INSERT INTO Attendance (userid, opportunityid, attended)
      VALUES ($1, $2, true)
      RETURNING *
    `;
    const result = await pool.query(insertSql, [userId, eventId]);
    return result.rows[0];
  }
};

const removeAttendance = async (eventId, userId) => {
  const deleteSql = `
    DELETE FROM Attendance 
    WHERE opportunityid = $1 AND userid = $2
  `;
  await pool.query(deleteSql, [eventId, userId]);
};

module.exports = {
  addAttendance,
  removeAttendance
};