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
      'name', u.UserName,
      'role', 'Organizator volontiranja',
      'avatar', 'avatar_default' -- Potrebno zamijeniti
    ) AS organizer,
    (SELECT FileName FROM EventImages WHERE OpportunityID = vo.OpportunityID LIMIT 1) AS image,
    (SELECT json_agg(UserID) FROM Attendance WHERE OpportunityID = vo.OpportunityID AND Attended = true LIMIT 5) AS avatars,
    (SELECT json_agg(json_build_object('id', a.UserID, 'name', u2.UserName))
    FROM Attendance a
    JOIN "User" u2 ON a.UserID = u2.UserId
    WHERE a.OpportunityID = vo.OpportunityID AND a.Attended = true LIMIT 5) AS participants
    FROM VolunteerOpportunity vo
    JOIN "User" u ON vo.UserIDOfOrganisator = u.UserId
    ORDER BY vo.OpportunityDate ASC;
    ;
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
      'name', u.UserName,
      'role', 'Organizator volontiranja',
      'avatar', 'avatar_default' -- Potrebno zamijeniti
    ) AS organizer,
    (SELECT FileName FROM EventImages WHERE OpportunityID = vo.OpportunityID LIMIT 1) AS image,
    (SELECT json_agg(UserID) FROM Attendance WHERE OpportunityID = vo.OpportunityID AND Attended = true LIMIT 5) AS avatars,
    (SELECT json_agg(json_build_object('id', a.UserID, 'name', u2.UserName))
    FROM Attendance a
    JOIN "User" u2 ON a.UserID = u2.UserId
    WHERE a.OpportunityID = vo.OpportunityID AND a.Attended = true LIMIT 5) AS participants,
    (
      SELECT json_agg(k.Name) 
      FROM EventKeyword ek
      JOIN Keyword k ON ek.KeywordID = k.KeywordID
      WHERE ek.EventID = vo.OpportunityID
    ) AS keywords
    FROM VolunteerOpportunity vo
    JOIN "User" u ON vo.UserIDOfOrganisator = u.UserId
    WHERE vo.OpportunityID = $1;
  `;

  const result = await pool.query(sql, [id]);

  return result.rows[0] || null;
};

const create = async (eventData) => {
  const {
    title,
    description,
    category,
    image,
    dateFrom,
    dateTo,
    frequency,
    location,
    transport,
    minVolunteers,
    maxVolunteers,
    equipment,
    shareToSocialMedia,
    isPrivate,
    userId
  } = eventData;

  const sql = `
    INSERT INTO VolunteerOpportunity (
      OpportunityTitle,
      Description,
      Category,
      OpportunityDate,
      EndDate,
      Frequency,
      Location,
      RideToTheDestination,
      MinimumVolunteers,
      MaximumVolunteers,
      EquipmentRequired,
      CanShareToSocialMedia,
      IsPrivateEvent,
      UserIDOfOrganisator
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *
  `;

  const values = [
    title,
    description,
    category,
    dateFrom,
    dateTo,
    frequency,
    location,
    transport,
    minVolunteers,
    maxVolunteers,
    equipment,
    shareToSocialMedia,
    isPrivate,
    userId
  ];

  const result = await pool.query(sql, values);
  return result.rows[0];
};


module.exports = {
  getAll,
  getById,
  create
};
