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
    image,
    keywords, // array of keyword IDs (brojevi)
    startDate,
    endDate,
    frequencyId,
    frequencyVolume,
    location,
    transport,
    minVolunteers,
    maxVolunteers,
    duration,
    equipment,
    shareToSocialMedia,
    isPrivate,
    userId,
  } = eventData;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Kreiraj event
    const sql = `
      INSERT INTO VolunteerOpportunity (
        opportunitytitle,
        description,
        opportunitydate,
        enddate,
        frequencyid,
        frequencyvolume,
        location,
        ridetothedestination,
        minimumvolunteers,
        maximumvolunteers,
        duration,
        equipmentrequired,
        cansharetosocialmedia,
        isprivateevent,
        useridoforganisator
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING opportunityid
    `;

    const values = [
      title,
      description,
      startDate,
      endDate,
      frequencyId,
      frequencyVolume,
      location,
      transport,
      minVolunteers,
      maxVolunteers,
      duration,
      equipment,
      shareToSocialMedia,
      isPrivate,
      userId,
    ];

    const result = await client.query(sql, values);
    const eventId = result.rows[0].opportunityid;

    if (Array.isArray(keywords) && keywords.length > 0) {
      const keywordSql = `
        INSERT INTO eventkeyword (eventid, keywordid)
        VALUES ($1, $2)
      `;
      for (const keywordId of keywords) {
        await client.query(keywordSql, [eventId, keywordId]);
      }
    }

    await client.query('COMMIT');
    return { ...result.rows[0], eventid: eventId };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};


module.exports = {
  getAll,
  getById,
  create
};