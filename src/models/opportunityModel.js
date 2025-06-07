const pool = require('../db');

const getAll = async (currentUser) => {
  const whereSql = currentUser ? `WHERE vo.useridoforganisator != ${currentUser}` : ''; 

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
              'id', 
              u.userid,
              'name', 
              u.UserName, 
              'role', 
              u.role,
              'avatar',
              up.filename
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
                json_agg(UserID) 
              FROM 
                Attendance 
              WHERE 
                OpportunityID = vo.OpportunityID 
                AND Attended = true 
              LIMIT 
                5
            ) AS avatars, 
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
              LIMIT 
                5
            ) AS participants, 
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
                'avatar', up.filename
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
                  json_agg(UserID) 
                FROM 
                  Attendance 
                WHERE 
                  OpportunityID = vo.OpportunityID 
                  AND Attended = true 
                LIMIT 
                  5
              ) AS avatars, 
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
                  json_agg(
                    json_build_object(
                      'id', 
                      vo2.OpportunityID, 
                      'title', 
                      vo2.OpportunityTitle, 
                      'location', 
                      vo2.Location, 
                      'dateTime', 
                      vo2.OpportunityDate, 
                      'image', 
                      (
                        SELECT 
                          FileName 
                        FROM 
                          EventImages 
                        WHERE 
                          OpportunityID = vo2.OpportunityID 
                        LIMIT 
                          1
                      )
                    )
                  ) 
                FROM 
                  VolunteerOpportunity vo2 
                  JOIN EventKeyword ek2 ON vo2.OpportunityID = ek2.EventID 
                WHERE 
                  ek2.KeywordID IN (
                    SELECT 
                      KeywordID 
                    FROM 
                      EventKeyword 
                    WHERE 
                      EventID = vo.OpportunityID
                  ) 
                  AND vo2.OpportunityID <> vo.OpportunityID 
                LIMIT 
                  4
              ) AS relatedEvents 
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
    userId
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
        longitude
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
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
      longitude
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

module.exports = {
  getAll,
  getById,
  create,
  uploadOrUpdateEventImage
};
