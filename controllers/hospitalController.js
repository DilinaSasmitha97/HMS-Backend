const Hospital = require('../models/Hospital');
const asyncHandler = require('../utils/asyncHandler');

exports.listHospitals = asyncHandler(async (req, res) => {
  const hospitals = await Hospital.find().sort({ name: 1 });
  res.json(hospitals);
});

exports.createHospital = asyncHandler(async (req, res) => {
  const hospital = await Hospital.create(req.body);
  res.status(201).json(hospital);
});
