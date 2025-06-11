const pool = require('../db');

const getOpportunities = async (filter = '') => {
  const whereSql = filter ? `WHERE ${filter}` : '';
  const sql = `
    SELECT 
      vo.OpportunityID AS id, 
      vo.OpportunityTitle AS title, 
      vo.Location AS location, 
      TO_CHAR(vo.OpportunityDate, 'HH24:MI') AS time, 
      json_build_object(
        'day', 
        EXTRACT(DAY FROM vo.OpportunityDate), 
        'month', 
        TO_CHAR(vo.OpportunityDate, 'Mon')
      ) AS date, 
      vo.duration AS duration, 
      vo.OpportunityDate AS dateTime, 
      vo.Description AS description, 
      json_build_object(
        'id', u.userid,
        'name', u.UserName, 
        'role', u.role,
        'avatar', up.filename,
        'recently_active', (NOW() - u.lastlogin <= interval '1 hour')
      ) AS organizer, 
      (
        SELECT FileName FROM EventImages WHERE OpportunityID = vo.OpportunityID LIMIT 1
      ) AS image, 
      (
        SELECT json_agg(
          json_build_object('id', a.UserID, 'name', u2.UserName, 'avatar', up2.filename)
        ) 
        FROM Attendance a 
        JOIN "User" u2 ON a.UserID = u2.UserId 
        LEFT JOIN userprofile up2 ON u2.UserId = up2.userid
        WHERE a.OpportunityID = vo.OpportunityID AND a.Attended = true LIMIT 5
      ) AS participants, 
      minimumvolunteers, 
      maximumvolunteers, 
      (
        SELECT COUNT(*) 
        FROM Attendance a 
        WHERE a.OpportunityID = vo.OpportunityID AND a.Attended = true
      ) AS attendeesCount, 
      (
        SELECT COUNT(*) 
        FROM Attendance a 
        WHERE a.OpportunityID = vo.OpportunityID AND a.Attended = true
      ) >= vo.maximumvolunteers AS isFull,
      (
        SELECT COUNT(*) 
        FROM comments c 
        WHERE c.opportunityid = vo.OpportunityID
      ) AS commentsCount,
      ridetothedestination, 
      equipmentrequired, 
      latitude, 
      longitude 
    FROM VolunteerOpportunity vo
    JOIN "User" u ON vo.UserIDOfOrganisator = u.UserId
    LEFT JOIN userprofile up ON u.UserId = up.userid
    ${whereSql}
    ORDER BY vo.OpportunityDate ASC
  `;
  const result = await pool.query(sql);
  return result.rows;
};

const getAll = async (currentUser) => {
  const filter = currentUser ? `vo.useridoforganisator != ${currentUser}` : '';
  return getOpportunities(filter);
};

const getApproved = async () => {
  return getOpportunities('is_approved = TRUE');
};

const getPending = async () => {
  return getOpportunities('is_approved = FALSE');
};

const getById = async (eventId, userId) => {
  const sql = `
            SELECT 
              vo.OpportunityID AS id, 
              vo.OpportunityTitle AS title, 
              vo.Location AS location, 
              TO_CHAR(vo.OpportunityDate, 'HH24:MI') AS time, 
              json_build_object(
                'day', 
                EXTRACT(
                  DAY 
                  FROM 
                    vo.OpportunityDate
                ), 
                'month', 
                TO_CHAR(vo.OpportunityDate, 'Mon')
              ) AS date, 
              vo.duration AS duration, 
              vo.OpportunityDate AS dateTime, 
              vo.Description AS description, 
              json_build_object(
                'id', u.userid,'name', u.UserName, 'role', u.role, 
                'avatar', up.filename, 'recently_active', (NOW() - u.lastlogin <= interval '1 hour')
              ) AS organizer, 
              (
                SELECT 
                  FileName 
                FROM 
                  EventImages 
                WHERE 
                  OpportunityID = vo.OpportunityID 
                LIMIT 
                  1
              ) AS image,
              (
                SELECT 
                  json_agg(
                    json_build_object(
                      'id', a.UserID, 'name', u2.UserName, 'avatar', up2.filename
                    )
                  ) 
                FROM 
                  Attendance a 
                  JOIN "User" u2 ON a.UserID = u2.UserId
                  LEFT JOIN userprofile up2 ON u2.UserId = up2.userid 
                WHERE 
                  a.OpportunityID = vo.OpportunityID 
                  AND a.Attended = true
              ) AS participants, 
              (
                SELECT 
                  json_agg(k.Name) 
                FROM 
                  EventKeyword ek 
                  JOIN Keyword k ON ek.KeywordID = k.KeywordID 
                WHERE 
                  ek.EventID = vo.OpportunityID
              ) AS keywords, 
              EXISTS(
                SELECT 
                  1 
                FROM 
                  Attendance att 
                WHERE 
                  att.OpportunityID = vo.OpportunityID 
                  AND att.UserID = $2 
                  AND att.Attended = true
              ) AS "isUserAttending", 
              minimumvolunteers, 
              maximumvolunteers, 
              (
                SELECT 
                  COUNT(*) 
                FROM 
                  Attendance a 
                WHERE 
                  a.OpportunityID = vo.OpportunityID 
                  AND a.Attended = true
              ) AS attendeesCount, 
              (
                SELECT 
                  COUNT(*) 
                FROM 
                  Attendance a 
                WHERE 
                  a.OpportunityID = vo.OpportunityID 
                  AND a.Attended = true
              ) >= vo.maximumvolunteers AS isFull, 
              (
                SELECT 
                  COUNT(*) 
                FROM 
                  comments c 
                WHERE 
                  c.opportunityid = vo.OpportunityID
              ) AS commentsCount, 
              ridetothedestination, 
              equipmentrequired, 
              latitude, 
              longitude, 
              (
                SELECT 
                  jsonb_agg(
                    DISTINCT jsonb_build_object( 
                      'id', vo2.OpportunityID, 
                      'title', vo2.OpportunityTitle, 
                      'location', vo2.Location, 
                      'dateTime', vo2.OpportunityDate, 
                      'image', (
                        SELECT FileName 
                        FROM EventImages 
                        WHERE OpportunityID = vo2.OpportunityID 
                        LIMIT 1
                      ),
                      'organizer', jsonb_build_object(
                        'id', u3.userid,
                        'name', u3.username,
                        'role', u3.role,
                        'avatar', up3.filename
                      )
                    )
                  ) 
                FROM 
                  VolunteerOpportunity vo2 
                  JOIN EventKeyword ek2 ON vo2.OpportunityID = ek2.EventID 
                  JOIN "User" u3 ON vo2.UserIDOfOrganisator = u3.UserId 
                  LEFT JOIN userprofile up3 ON u3.UserId = up3.userid 
                WHERE 
                  ek2.KeywordID IN (
                    SELECT DISTINCT KeywordID
                    FROM EventKeyword 
                    WHERE EventID = vo.OpportunityID
                  ) 
                  AND vo2.OpportunityID <> vo.OpportunityID 
                LIMIT 4
              ) AS relatedEvents,
               (
                  SELECT 
                    jsonb_agg(
                      DISTINCT jsonb_build_object(
                        'id', vo2.OpportunityID,
                        'title', vo2.OpportunityTitle,
                        'location', vo2.Location,
                        'dateTime', vo2.OpportunityDate,
                        'image', (
                          SELECT FileName 
                          FROM EventImages 
                          WHERE OpportunityID = vo2.OpportunityID 
                          LIMIT 1
                        ),
                        'organizer', jsonb_build_object(
                          'id', u3.userid,
                          'name', u3.username,
                          'role', u3.role,
                          'avatar', up3.filename
                        ),
                        'isUserAttending', EXISTS(
                          SELECT 1 
                          FROM Attendance att 
                          WHERE att.OpportunityID = vo2.OpportunityID 
                            AND att.UserID = $2 
                            AND att.Attended = true
                        )
                      )
                    )
                  FROM 
                    VolunteerOpportunity vo2
                    JOIN "User" u3 ON vo2.UserIDOfOrganisator = u3.UserId
                    LEFT JOIN userprofile up3 ON u3.UserId = up3.userid
                  WHERE 
                    vo2.OpportunityID <> vo.OpportunityID
                    AND vo.OpportunityDate < (vo2.OpportunityDate + vo2.duration * interval '1 minute')
                    AND (vo.OpportunityDate + vo.duration * interval '1 minute') > vo2.OpportunityDate
                  LIMIT 4
                ) AS overlapping_events
            FROM 
              VolunteerOpportunity vo 
              JOIN "User" u ON vo.UserIDOfOrganisator = u.UserId
              LEFT JOIN userprofile up ON u.UserId = up.userid
            WHERE 
              vo.OpportunityID = $1;
`;

  const result = await pool.query(sql, [eventId, userId]);
  return result.rows[0] || null;
};

const create = async (eventData) => {
  // console.log(eventData);

  const {
    title,
    description,
    startDate,
    endDate,
    frequencyId,
    frequencyVolume,
    location,
    latitude,
    longitude,
    transport,
    minVolunteers,
    maxVolunteers,
    duration,
    equipment,
    shareToSocialMedia,
    isPrivate,
    userId,
    is_approved
  } = eventData;

  let keywords = eventData.keywords;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

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
        useridoforganisator,
        latitude,
        longitude,
        is_approved
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING opportunityid
    `;

    const parsedFrequencyVolume =
      frequencyVolume === undefined || frequencyVolume === null || frequencyVolume === ''
        ? null
        : parseInt(frequencyVolume, 10);

    const parsedMinVolunteers =
      minVolunteers === undefined || minVolunteers === null || minVolunteers === ''
        ? null
        : parseInt(minVolunteers, 10);

    const parsedMaxVolunteers =
      maxVolunteers === undefined || maxVolunteers === null || maxVolunteers === ''
        ? null
        : parseInt(maxVolunteers, 10);


    const values = [
      title,
      description,
      startDate,
      endDate,
      frequencyId,
      parsedFrequencyVolume,
      location,
      transport,
      parsedMinVolunteers,
      parsedMaxVolunteers,
      duration,
      equipment,
      shareToSocialMedia,
      isPrivate,
      userId,
      latitude,
      longitude,
      is_approved
    ];

    const result = await client.query(sql, values);
    const eventId = result.rows[0].opportunityid;

    if (typeof keywords === 'string') {
      keywords = JSON.parse(keywords);
    }

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

const uploadOrUpdateEventImage = async (eventId, filename) => {
  const fileext = filename.split('.').pop();
  const sql = `
    INSERT INTO eventimages (opportunityid, filename, fileext, uploaddatetime)
    VALUES ($1, $2, $3, NOW())
    ON CONFLICT (opportunityid)
    DO UPDATE SET filename = EXCLUDED.filename, fileext = EXCLUDED.fileext, uploaddatetime = NOW()
    RETURNING *;
  `;
  const result = await pool.query(sql, [eventId, filename, fileext]);
  return result.rows[0];
};

const approve = async (eventId) => {
  const sql = `
    UPDATE volunteeropportunity 
    SET is_approved = TRUE 
    WHERE opportunityid = $1 
    RETURNING *`;

  const result = await pool.query(sql, [eventId]);
  return result.rows[0] || null;
};

module.exports = {
  getAll,
  getById,
  create,
  uploadOrUpdateEventImage,
  getApproved,
  getPending,
  approve
};
