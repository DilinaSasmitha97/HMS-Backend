const Doctor = require('../models/Doctor');
const DoctorAvailability = require('../models/DoctorAvailability');
const Appointment = require('../models/Appointment');
const asyncHandler = require('../utils/asyncHandler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.listDoctors = asyncHandler(async (req, res) => {
  const { hospitalId } = req.query;
  const filter = hospitalId ? { hospital: hospitalId } : {};
  const doctors = await Doctor.find(filter).populate('hospital', 'name');
  res.json(doctors);
});

exports.createDoctor = asyncHandler(async (req, res) => {
  const { name, specialty, hospital, email, password } = req.body || {};
  if (!name) {
    res.status(400);
    throw new Error('name is required');
  }
  let payload = { name, specialty };
  if (hospital) payload.hospital = hospital;
  if (email) {
    const emailNorm = String(email).toLowerCase().trim();
    const exists = await Doctor.findOne({ email: emailNorm });
    if (exists) {
      res.status(409);
      throw new Error('Doctor with this email already exists');
    }
    payload.email = emailNorm;
  }
  if (password) {
    if (String(password).length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters');
    }
    payload.passwordHash = await bcrypt.hash(password, 10);
  }
  const doctor = await Doctor.create(payload);
  res.status(201).json(doctor);
});

// POST /api/doctors/login
exports.loginDoctor = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    res.status(400);
    throw new Error('email and password are required');
  }
  const doc = await Doctor.findOne({ email: String(email).toLowerCase().trim() }).select('+passwordHash');
  if (!doc || !doc.passwordHash) {
    res.status(401);
    throw new Error('Invalid credentials');
  }
  const ok = await bcrypt.compare(password, doc.passwordHash);
  if (!ok) {
    res.status(401);
    throw new Error('Invalid credentials');
  }
  const token = jwt.sign({ sub: doc._id, role: 'doctor' }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
  res.json({ token, doctor: { id: doc._id, name: doc.name, email: doc.email } });
});

// POST /api/doctors/availability (doctor only)
exports.createAvailability = asyncHandler(async (req, res) => {
  const { doctorId, hospitalId, start, end, capacity } = req.body || {};
  if (!doctorId || !hospitalId || !start || !end || !capacity) {
    res.status(400);
    throw new Error('doctorId, hospitalId, start, end, capacity are required');
  }
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (!(startDate < endDate)) {
    res.status(400);
    throw new Error('start must be before end');
  }
  const avail = await DoctorAvailability.create({ doctor: doctorId, hospital: hospitalId, start: startDate, end: endDate, capacity });
  res.status(201).json(avail);
});

// GET /api/doctors/availability?doctorId=&hospitalId=&from=&to=
exports.listAvailability = asyncHandler(async (req, res) => {
  const { doctorId, hospitalId, from, to } = req.query || {};
  const filter = {};
  if (doctorId) filter.doctor = doctorId;
  if (hospitalId) filter.hospital = hospitalId;
  if (from || to) {
    filter.start = {};
    if (from) filter.start.$gte = new Date(from);
    if (to) filter.start.$lte = new Date(to);
  }
  const list = await DoctorAvailability.find(filter).populate('hospital', 'name').sort({ start: 1 });
  // compute remaining slots from appointments count
  const withRemaining = await Promise.all(list.map(async (a) => {
    const count = await Appointment.countDocuments({
      doctor: a.doctor,
      hospital: a.hospital,
      availability: a._id,
      status: { $ne: 'cancelled' },
    });
    return { ...a.toObject(), remaining: Math.max(0, a.capacity - count) };
  }));
  res.json(withRemaining);
});
