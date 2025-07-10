const pool = require('../db');

const getAllForUser = async (userId) => {
  const sql = `
    SELECT DISTINCT
      vo.OpportunityID AS id,
      vo.OpportunityTitle AS title,
      vo.Location AS location,
      TO_CHAR(vo.OpportunityDate, 'HH24:MI') AS time,
      jsonb_build_object(
        'day', EXTRACT(DAY FROM vo.OpportunityDate),
        'month', TO_CHAR(vo.OpportunityDate, 'Mon')
      ) AS date,
      vo.duration AS duration,
      vo.OpportunityDate AS dateTime,
      vo.Description AS description,
      jsonb_build_object(
        'id', u.userid,
        'name', u.UserName,
        'role', u.role,
        'avatar', up.filename
      ) AS organizer,
      (SELECT FileName FROM EventImages WHERE OpportunityID = vo.OpportunityID LIMIT 1) AS image,
      (SELECT jsonb_agg(UserID) FROM Attendance WHERE OpportunityID = vo.OpportunityID AND Attended = true LIMIT 5) AS avatars,
      (SELECT jsonb_agg(jsonb_build_object('id', a.UserID, 'name', u2.UserName, 'avatar', up2.filename))
        FROM Attendance a
        JOIN "User" u2 ON a.UserID = u2.UserId
        LEFT JOIN userprofile up2 ON u2.UserId = up2.userid
        WHERE a.OpportunityID = vo.OpportunityID AND a.Attended = true LIMIT 5) AS participants
    FROM VolunteerOpportunity vo
    JOIN "User" u ON vo.UserIDOfOrganisator = u.UserId
    LEFT JOIN userprofile up ON u.UserId = up.userid
    LEFT JOIN Attendance at ON at.OpportunityID = vo.OpportunityID
    WHERE 
      (at.UserID = $1 AND at.Attended = true) 
      OR vo.UserIDOfOrganisator = $1
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

const getAllForEvent = async (eventId) => {
  const sql = `
    SELECT 
      u.userid AS id,
      u.username AS name,
      up.first_name,
      up.last_name,
      up.filename AS avatar,
      a.attended,
      a.created_at AS registration_date
    FROM attendance a
    JOIN "User" u ON a.userid = u.userid
    LEFT JOIN userprofile up ON u.userid = up.userid
    WHERE a.opportunityid = $1
    ORDER BY a.created_at DESC;
  `;
  const result = await pool.query(sql, [eventId]);
  return result.rows;
};

const getClosedForUser = async (userId) => {
  const sql = `
    SELECT DISTINCT
      vo.OpportunityID AS id,
      vo.OpportunityTitle AS title,
      vo.Location AS location,
      TO_CHAR(vo.OpportunityDate, 'HH24:MI') AS time,
      jsonb_build_object(
        'day', EXTRACT(DAY FROM vo.OpportunityDate),
        'month', TO_CHAR(vo.OpportunityDate, 'Mon')
      ) AS date,
      vo.duration AS duration,
      vo.OpportunityDate AS dateTime,
      vo.Description AS description,
      jsonb_build_object(
        'id', u.userid,
        'name', u.UserName,
        'role', u.role,
        'avatar', up.filename
      ) AS organizer,
      (vo.UserIDOfOrganisator = $1) AS "isOrganizer",
      (SELECT FileName FROM EventImages WHERE OpportunityID = vo.OpportunityID LIMIT 1) AS image,
      (SELECT jsonb_agg(UserID) FROM Attendance WHERE OpportunityID = vo.OpportunityID AND Attended = true LIMIT 5) AS avatars,
      (SELECT jsonb_agg(jsonb_build_object('id', a.UserID, 'name', u2.UserName, 'avatar', up2.filename))
        FROM Attendance a
        JOIN "User" u2 ON a.UserID = u2.UserId
        LEFT JOIN userprofile up2 ON u2.UserId = up2.userid
        WHERE a.OpportunityID = vo.OpportunityID AND a.Attended = true LIMIT 5) AS participants
    FROM VolunteerOpportunity vo
    JOIN "User" u ON vo.UserIDOfOrganisator = u.UserId
    LEFT JOIN userprofile up ON u.UserId = up.userid
    LEFT JOIN Attendance at ON at.OpportunityID = vo.OpportunityID AND at.UserID = $1
    WHERE 
      vo.is_closed = TRUE
      AND (
        (at.UserID = $1 AND at.Attended = true)
        OR vo.UserIDOfOrganisator = $1
      )
    ORDER BY vo.OpportunityDate DESC
  `;
  const result = await pool.query(sql, [userId]);
  return result.rows;
};

module.exports = {
  addAttendance,
  removeAttendance,
  getAllForUser,
  getAllForEvent,
  getClosedForUser
};