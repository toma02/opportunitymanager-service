const pool = require('../db');

const getAll = async () => {
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
      'name', u."UserName",
      'role', 'Organizator volontiranja',
      'avatar', 'avatar_default' -- Potrebno zamijeniti
    ) AS organizer,
    (SELECT FileName FROM EventImages WHERE OpportunityID = vo.OpportunityID LIMIT 1) AS image,
    (SELECT json_agg(UserID) FROM Attendance WHERE OpportunityID = vo.OpportunityID AND Attended = true LIMIT 5) AS avatars,
    (SELECT json_agg(json_build_object('id', a.UserID, 'name', u2."UserName"))
    FROM Attendance a
    JOIN "User" u2 ON a.UserID = u2."UserId"
    WHERE a.OpportunityID = vo.OpportunityID AND a.Attended = true LIMIT 5) AS participants
    FROM VolunteerOpportunity vo
    JOIN "User" u ON vo.UserIDOfOrganisator = u."UserId";
  `;
  const result = await pool.query(sql);
  return result.rows;
};

const getById = async (id) => {
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
      'name', u."UserName",
      'role', 'Organizator volontiranja',
      'avatar', 'avatar_default' -- Potrebno zamijeniti
    ) AS organizer,
    (SELECT FileName FROM EventImages WHERE OpportunityID = vo.OpportunityID LIMIT 1) AS image,
    (SELECT json_agg(UserID) FROM Attendance WHERE OpportunityID = vo.OpportunityID AND Attended = true LIMIT 5) AS avatars,
    (SELECT json_agg(json_build_object('id', a.UserID, 'name', u2."UserName"))
    FROM Attendance a
    JOIN "User" u2 ON a.UserID = u2."UserId"
    WHERE a.OpportunityID = vo.OpportunityID AND a.Attended = true LIMIT 5) AS participants,
    (
      SELECT json_agg(k.Name) 
      FROM EventKeyword ek
      JOIN Keyword k ON ek.KeywordID = k.KeywordID
      WHERE ek.EventID = vo.OpportunityID
    ) AS keywords
    FROM VolunteerOpportunity vo
    JOIN "User" u ON vo.UserIDOfOrganisator = u."UserId"
    WHERE vo.OpportunityID = $1;
  `;

  const result = await pool.query(sql, [id]);

  return result.rows[0] || null;
};

module.exports = {
  getAll,
  getById
};
