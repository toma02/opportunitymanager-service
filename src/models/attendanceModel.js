const pool = require('../db');

const getAllForUser = async (userId) => {
  const sql = `
    SELECT
      vo.OpportunityID AS id,
      vo.OpportunityTitle AS title,
      vo.Location AS location,
      TO_CHAR(vo.OpportunityDate, 'HH24:MI') AS time,
      json_build_object(
        'day', EXTRACT(DAY FROM vo.OpportunityDate),
        'month', TO_CHAR(vo.OpportunityDate, 'Mon')
      ) AS date,
      vo.duration AS duration,
      vo.OpportunityDate AS dateTime,
      vo.Description AS description,
      json_build_object(
        'name', u.UserName,
        'role', 'Organizator volontiranja',
        'avatar', 'avatar_default'
      ) AS organizer,
      (SELECT FileName FROM EventImages WHERE OpportunityID = vo.OpportunityID LIMIT 1) AS image,
      (SELECT json_agg(UserID) FROM Attendance WHERE OpportunityID = vo.OpportunityID AND Attended = true LIMIT 5) AS avatars,
      (SELECT json_agg(json_build_object('id', a.UserID, 'name', u2.UserName))
        FROM Attendance a
        JOIN "User" u2 ON a.UserID = u2.UserId
        WHERE a.OpportunityID = vo.OpportunityID AND a.Attended = true LIMIT 5) AS participants
    FROM VolunteerOpportunity vo
    JOIN "User" u ON vo.UserIDOfOrganisator = u.UserId
    JOIN Attendance at ON at.OpportunityID = vo.OpportunityID
    WHERE at.UserID = $1 AND at.Attended = true
    ORDER BY vo.OpportunityDate ASC
  `;
  const result = await pool.query(sql, [userId]);
  return result.rows;
};

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
  removeAttendance,
  getAllForUser
};