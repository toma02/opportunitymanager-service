const pool = require('../db');

const getBasicStatistics = async () => {
  const sql = `
    SELECT json_build_object(
      'total_events', (SELECT COUNT(*) FROM volunteeropportunity),
      'active_events', (SELECT COUNT(*) FROM volunteeropportunity WHERE opportunitydate > NOW()),
      'past_events', (SELECT COUNT(*) FROM volunteeropportunity WHERE (opportunitydate + duration * INTERVAL '1 minute') < NOW()),
      'total_users', (SELECT COUNT(*) FROM "User"),
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
      ), 2), 0)
    ) AS stats;
  `;
  const result = await pool.query(sql);
  return result.rows[0].stats;
};

module.exports = {
  getBasicStatistics
};
