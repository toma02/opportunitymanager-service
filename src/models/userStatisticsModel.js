const pool = require('../db');

const getBasicStatistics = async () => {
  const sql = `
    SELECT json_build_object(
      -- Osnovne statistike
      'basic', json_build_object(
        'total_events', (SELECT COUNT(*) FROM volunteeropportunity),
        'upcoming_events', (SELECT COUNT(*) FROM volunteeropportunity WHERE opportunitydate > NOW()),
        'active_events', (SELECT COUNT(*) FROM volunteeropportunity WHERE opportunitydate <= NOW() AND (opportunitydate + duration * INTERVAL '1 minute') > NOW()),
        'past_events', (SELECT COUNT(*) FROM volunteeropportunity WHERE (opportunitydate + duration * INTERVAL '1 minute') < NOW()),
        'total_users', (SELECT COUNT(*) FROM "User"),
        'total_verified_users', (SELECT COUNT(*) FROM "User" WHERE emailverified = TRUE),
        'verified_profiles_count', (SELECT COUNT(*) FROM userprofile WHERE verification_status = 'verified'),
        'new_users_7_days', (SELECT COUNT(*) FROM "User" WHERE createdat >= NOW() - INTERVAL '7 days'),
        'new_users_30_days', (SELECT COUNT(*) FROM "User" WHERE createdat >= NOW() - INTERVAL '30 days'),
        'new_events_7_days', (SELECT COUNT(*) FROM volunteeropportunity WHERE created_at >= NOW() - INTERVAL '7 days'),
        'new_registrations_on_recent_events', (
          SELECT COUNT(*) FROM attendance a
          JOIN volunteeropportunity vo ON vo.opportunityid = a.opportunityid
          WHERE vo.created_at >= NOW() - INTERVAL '7 days'
        ),
        'total_favorites', (SELECT COUNT(*) FROM userfavorites),
        'total_comments', (SELECT COUNT(*) FROM comments),
        'total_registrations', (SELECT COUNT(*) FROM attendance),
        'avg_attendance_per_event', COALESCE(ROUND((
          SELECT AVG(attendance_count) FROM (
            SELECT (SELECT COUNT(*) FROM attendance a WHERE a.OpportunityID = vo.OpportunityID) AS attendance_count
            FROM volunteeropportunity vo
          ) AS t
        ), 2), 0),
        'avg_favorites_per_event', COALESCE(ROUND((
          SELECT AVG(favorites_count) FROM (
            SELECT (SELECT COUNT(*) FROM userfavorites uf WHERE uf.OpportunityID = vo.OpportunityID) AS favorites_count
            FROM volunteeropportunity vo
          ) AS t
        ), 2), 0),
        'avg_comments_per_event', COALESCE(ROUND((
          SELECT AVG(comments_count) FROM (
            SELECT (SELECT COUNT(*) FROM comments c WHERE c.OpportunityID = vo.OpportunityID) AS comments_count
            FROM volunteeropportunity vo
          ) AS t
        ), 2), 0),
        'most_active_month', (
          SELECT to_char(opportunitydate, 'YYYY-MM') AS month
          FROM volunteeropportunity
          GROUP BY month
          ORDER BY COUNT(*) DESC
          LIMIT 1
        ),
        'problem_reports_count', (SELECT COUNT(*) FROM commentreports),
        'total_volunteering_hours', (
          SELECT COALESCE(ROUND(SUM(vo.duration) / 60.0, 1), 0)
          FROM attendance a
          JOIN volunteeropportunity vo ON vo.opportunityid = a.opportunityid
          WHERE a.attended = TRUE
        )
      ),
      'events_per_keyword', (
        SELECT json_agg(json_build_object('keyword', k.name, 'count', cnt))
        FROM (
          SELECT ek.keywordid, COUNT(*) AS cnt
          FROM eventkeyword ek
          GROUP BY ek.keywordid
          ORDER BY cnt DESC
        ) AS keyword_counts
        JOIN keyword k ON k.keywordid = keyword_counts.keywordid
      ),
      'comments_per_event', (
        SELECT json_agg(json_build_object('eventid', c.opportunityid, 'title', vo.opportunitytitle, 'count', c.cnt))
        FROM (
          SELECT comments.opportunityid, COUNT(*) AS cnt
          FROM comments
          GROUP BY comments.opportunityid
          ORDER BY cnt DESC
          LIMIT 6
        ) AS c
        JOIN volunteeropportunity vo ON vo.opportunityid = c.opportunityid
      ),
      'favorites_per_event', (
        SELECT json_agg(json_build_object('eventid', f.opportunityid, 'title', vo.opportunitytitle, 'count', f.cnt))
        FROM (
          SELECT userfavorites.opportunityid, COUNT(*) AS cnt
          FROM userfavorites
          GROUP BY userfavorites.opportunityid
          ORDER BY cnt DESC
          LIMIT 6
        ) AS f
        JOIN volunteeropportunity vo ON vo.opportunityid = f.opportunityid
      ),
      'registrations_per_event', (
        SELECT json_agg(json_build_object('eventid', r.opportunityid, 'title', vo.opportunitytitle, 'count', r.cnt))
        FROM (
          SELECT attendance.opportunityid, COUNT(*) AS cnt
          FROM attendance
          GROUP BY attendance.opportunityid
          ORDER BY cnt DESC
          LIMIT 6
        ) AS r
        JOIN volunteeropportunity vo ON vo.opportunityid = r.opportunityid
      ),
      'events_per_month', (
        SELECT json_agg(json_build_object('month', month, 'count', cnt))
        FROM (
          SELECT to_char(opportunitydate, 'YYYY-MM') AS month, COUNT(*) AS cnt
          FROM volunteeropportunity
          GROUP BY month
          ORDER BY cnt DESC
        ) AS month_counts
      ),
      'most_active_volunteers', (
        SELECT json_agg(json_build_object('userid', u.userid, 'username', u.username, 'count', cnt))
        FROM (
          SELECT a.userid, COUNT(*) AS cnt
          FROM attendance a
          GROUP BY a.userid
          ORDER BY cnt DESC
          LIMIT 6
        ) AS top_volunteers
        JOIN "User" u ON u.userid = top_volunteers.userid
      ),
      'avg_participation_per_user', (
        SELECT ROUND(AVG(cnt), 2) FROM (
          SELECT userid, COUNT(*) AS cnt
          FROM attendance
          GROUP BY userid
        ) AS user_counts
      )
    ) AS stats;
  `;
  const result = await pool.query(sql);
  return result.rows[0].stats;
};

module.exports = {
  getBasicStatistics
};
