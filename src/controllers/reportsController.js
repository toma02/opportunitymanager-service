const reportsModel = require('../models/reportsModel');
const Messages = require('../enums/messages.enum');

exports.getAllReports = async (req, res, next) => {
  try {
    const reports = await reportsModel.getAllReports();
    res.json(reports);
  } catch (err) {
    next(err);
  }
};

exports.getReportById = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: Messages.ID_REQUIRED });
    }
    const report = await reportsModel.getReportById(id);
    if (!report) {
      return res.status(404).json({ error: Messages.REPORT_NOT_FOUND });
    }
    res.json(report);
  } catch (err) {
    next(err);
  }
};

exports.addReport = async (req, res, next) => {
  try {
    const { user_id, type, description, app_version, device_info } = req.body;
    console.log({ user_id, type, description, app_version, device_info });
    if (!type || !description) {
      return res.status(400).json({ error: Messages.TYPE_AND_DESCRIPTION_REQUIRED });
    }
    const newReport = await reportsModel.addReport({ user_id, type, description, app_version, device_info });
    res.status(201).json(newReport);
  } catch (err) {
    next(err);
  }
};

exports.updateReportStatus = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    if (!id || !status) {
      return res.status(400).json({ error: Messages.ID_AND_STATUS_REQUIRED });
    }
    const updatedReport = await reportsModel.updateReportStatus(id, status);
    if (!updatedReport) {
      return res.status(404).json({ error: Messages.REPORT_NOT_FOUND });
    }
    res.json(updatedReport);
  } catch (err) {
    next(err);
  }
};

exports.deleteReport = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: Messages.ID_REQUIRED });
    }
    const deletedReport = await reportsModel.deleteReport(id);
    if (!deletedReport) {
      return res.status(404).json({ error: Messages.REPORT_NOT_FOUND });
    }
    res.json({ success: true, deletedReport });
  } catch (err) {
    next(err);
  }
};