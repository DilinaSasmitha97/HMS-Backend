const Record = require('../models/Record');
const asyncHandler = require('../utils/asyncHandler');


exports.listRecords = asyncHandler(async (req, res) => {
  const { patientId } = req.query;
  if (!patientId) {
    res.status(400);
    throw new Error('patientId is required');
  }
  const records = await Record.find({ patient: patientId }).sort({ createdAt: -1 });
  res.json(records);
});

exports.createRecord = asyncHandler(async (req, res) => {
  const rec = await Record.create(req.body);
  res.status(201).json(rec);
});

