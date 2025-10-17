const LabRequest = require('../models/LabRequest');
const Record = require('../models/Record');
const Patient = require('../models/Patient');
const asyncHandler = require('../utils/asyncHandler');

exports.listLabRequests = asyncHandler(async (req, res) => {
  const { status, patientId } = req.query;
  const filter = {};
  if (status) {
    filter.status = status;
  }
  if (patientId) {
    filter.patient = patientId;
  }
  const list = await LabRequest.find(filter)
    .populate('patient', 'name')
    .populate('orderedBy', 'name');
  res.json(list);
});

exports.createLabRequest = asyncHandler(async (req, res) => {
  const lr = await LabRequest.create(req.body);
  res.status(201).json(lr);
});


// POST /api/lab/requests/:id/verify-pin
exports.verifyLabRequestPin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { pin } = req.body || {};
  if (!pin) {
    res.status(400);
    throw new Error('pin is required');
  }
  const lr = await LabRequest.findById(id);
  if (!lr) {
    res.status(404);
    throw new Error('Lab request not found');
  }
  const patient = await Patient.findById(lr.patient).select('+pin name');
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }
  if (String(patient.pin) !== String(pin)) {
    res.status(401);
    throw new Error('Invalid PIN');
  }
  res.json({ ok: true, patient: { id: patient._id, name: patient.name } });
});

// PATCH /api/lab/requests/:id/complete
// body: { pin: string, results: any, summary?: string }
exports.completeLabRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { results, summary, pin } = req.body || {};
  const lr = await LabRequest.findById(id);
  if (!lr) {
    res.status(404);
    throw new Error('Lab request not found');
  }
  if (!pin) {
    res.status(400);
    throw new Error('pin is required');
  }
  // Only allow completion for Scheduled requests
  if (lr.status !== 'Scheduled') {
    res.status(400);
    throw new Error('Only scheduled requests can be completed');
  }
  // Verify pin matches patient
  const patient = await Patient.findById(lr.patient).select('+pin');
  if (!patient || String(patient.pin) !== String(pin)) {
    res.status(401);
    throw new Error('Invalid PIN');
  }
  lr.status = 'Completed';
  await lr.save();
  // Create a lab record for the patient history
  const rec = await Record.create({
    patient: lr.patient,
    type: 'lab',
    summary: summary || `Lab result for ${lr.test}`,
    data: { test: lr.test, urgency: lr.urgency, results: results || {} },
  });
  res.json({ request: lr, record: rec });
});

// GET /api/lab/test-types
exports.listLabTestTypes = asyncHandler(async (req, res) => {
  const tests = [
    { key: 'cbc', name: 'Complete Blood Count (CBC)', category: 'Hematology' },
    { key: 'cmp', name: 'Comprehensive Metabolic Panel (CMP)', category: 'Chemistry' },
    { key: 'lipid', name: 'Lipid Profile', category: 'Chemistry' },
    { key: 'hba1c', name: 'HbA1c', category: 'Endocrinology' },
    { key: 'tsh', name: 'Thyroid Stimulating Hormone (TSH)', category: 'Endocrinology' },
    { key: 'lft', name: 'Liver Function Test (LFT)', category: 'Chemistry' },
    { key: 'rft', name: 'Renal Function Test (RFT)', category: 'Chemistry' },
    { key: 'urinalysis', name: 'Urinalysis', category: 'Urine' },
    { key: 'pcr_covid', name: 'COVID-19 PCR', category: 'Microbiology' },
    { key: 'xray_chest', name: 'X-Ray Chest', category: 'Radiology' },
  ];
  res.json(tests);
});
