const Patient = require('../models/Patient');
const asyncHandler = require('../utils/asyncHandler');
const bcrypt = require('bcryptjs');

exports.listPatients = asyncHandler(async (req, res) => {
  // include pin field in admin-facing patient list so admin can download QR codes
  const patients = await Patient.find().select('+pin').sort({ createdAt: -1 });
  // strip passwordHash but keep pin
  const safe = (patients || []).map((p) => {
    const obj = p.toObject();
    delete obj.passwordHash;
    return obj;
  });
  res.json(safe);
});

exports.createPatient = asyncHandler(async (req, res) => {
  const { email, pin, password, ...rest } = req.body || {};
  if (!email || !pin) {
    res.status(400);
    throw new Error('email and pin are required');
  }
  const emailNorm = String(email).toLowerCase().trim();
  const [emailExists, pinExists] = await Promise.all([
    Patient.findOne({ email: emailNorm }),
    Patient.findOne({ pin })
  ]);
  if (emailExists) {
    res.status(409);
    throw new Error('A patient with this email already exists');
  }
  if (pinExists) {
    res.status(409);
    throw new Error('This PIN is already assigned to another patient');
  }

  let passwordHash;
  if (password) {
    passwordHash = await bcrypt.hash(password, 10);
  }
  const patient = await Patient.create({ email: emailNorm, pin, ...rest, ...(passwordHash ? { passwordHash } : {}) });
  // strip sensitive fields explicitly just in case
  const { pin: _pin, passwordHash: _ph, ...safe } = patient.toObject();
  res.status(201).json(safe);
});

// POST /api/patients/login
exports.loginPatient = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    res.status(400);
    throw new Error('email and password are required');
  }
  const emailNorm = String(email).toLowerCase().trim();
  const patient = await Patient.findOne({ email: emailNorm }).select('+passwordHash');
  if (!patient || !patient.passwordHash) {
    res.status(401);
    throw new Error('Invalid credentials');
  }
  const ok = await bcrypt.compare(password, patient.passwordHash);
  if (!ok) {
    res.status(401);
    throw new Error('Invalid credentials');
  }
  // Issue a JWT similar to admin, but with role: 'patient'
  const { signToken } = require('../utils/jwt');
  const token = signToken({ sub: patient._id, role: 'patient' });
  const { pin: _pin, passwordHash: _pw, ...safe } = patient.toObject();
  res.json({ token, patient: { id: safe._id, name: safe.name, email: safe.email } });
});

// PUT /api/patients/:id/password
exports.updatePatientPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { password } = req.body || {};
  if (!password || password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const updated = await Patient.findByIdAndUpdate(id, { passwordHash }, { new: true });
  if (!updated) {
    res.status(404);
    throw new Error('Patient not found');
  }
  res.json({ id: updated._id, email: updated.email });
});

// GET /api/patients/lookup?pin=
exports.lookupPatientByPin = asyncHandler(async (req, res) => {
  const { pin } = req.query || {};
  if (!pin) {
    res.status(400);
    throw new Error('pin is required');
  }
  const patient = await Patient.findOne({ pin }).select('+pin');
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }
  const { pin: _pin, passwordHash: _pw, ...safe } = patient.toObject();
  res.json(safe);
});
