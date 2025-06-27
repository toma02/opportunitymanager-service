const pool = require('../db');

const getAllReports = async () => {
  const sql = `SELECT * FROM app_reports ORDER BY created_at DESC`;
  const result = await pool.query(sql);
  return result.rows;
};

const getReportById = async (id) => {
  const sql = `SELECT * FROM app_reports WHERE id = $1`;
  const result = await pool.query(sql, [id]);
  return result.rows[0];
};

const addReport = async ({ user_id, type, description, app_version, device_info }) => {
  const sql = `
    INSERT INTO app_reports (user_id, type, description, app_version, device_info, status, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, 'open', NOW(), NOW())
    RETURNING *;
  `;
  const result = await pool.query(sql, [user_id, type, description, app_version, device_info]);
  return result.rows[0];
};

const updateReportStatus = async (id, status) => {
  const sql = `
    UPDATE app_reports
    SET status = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *;
  `;
  const result = await pool.query(sql, [status, id]);
  return result.rows[0];
};

const deleteReport = async (id) => {
  const sql = `DELETE FROM app_reports WHERE id = $1 RETURNING *;`;
  const result = await pool.query(sql, [id]);
  return result.rows[0];
};

module.exports = {
  getAllReports,
  getReportById,
  addReport,
  updateReportStatus,
  deleteReport
};
