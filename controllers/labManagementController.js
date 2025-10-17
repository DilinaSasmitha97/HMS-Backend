const Lab = require('../models/Lab');
const LabRequest = require('../models/LabRequest');
const _Patient = require('../models/Patient');
const asyncHandler = require('../utils/asyncHandler');
const bcrypt = require('bcryptjs');
const { signToken } = require('../utils/jwt');

exports.listLabs = asyncHandler(async (req, res) => {
  const labs = await Lab.find().sort({ name: 1 });
  res.json(labs);
});

exports.createLab = asyncHandler(async (req, res) => {
  const { name, address, email, password } = req.body || {};
  const payload = { name, address };
  if (email) {
    payload.email = String(email).toLowerCase().trim();
  }
  if (password) {
    payload.passwordHash = await bcrypt.hash(password, 10);
  }
  const lab = await Lab.create(payload);
  res.status(201).json(lab);
});

exports.updateLabSlots = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { availableSlots } = req.body; // array of ISO strings
  const lab = await Lab.findByIdAndUpdate(
    id,
    { availableSlots: (availableSlots || []).map((d) => new Date(d)) },
    { new: true }
  );
  if (!lab) {
    res.status(404);
    throw new Error('Lab not found');
  }
  res.json(lab);
});

// POST /api/lab/login
exports.loginLab = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    res.status(400);
    throw new Error('email and password are required');
  }
  const lab = await Lab.findOne({ email: String(email).toLowerCase().trim() }).select('+passwordHash');
  if (!lab || !lab.passwordHash) {
    res.status(401);
    throw new Error('Invalid credentials');
  }
  const ok = await bcrypt.compare(password, lab.passwordHash);
  if (!ok) {
    res.status(401);
    throw new Error('Invalid credentials');
  }
  const token = signToken({ sub: lab._id, role: 'lab' });
  res.json({ token, lab: { id: lab._id, name: lab.name, email: lab.email } });
});

// Helper: generate 20-min slots between 08:30 and 15:00 local time for a given YYYY-MM-DD
function generateDaySlots(dateStr) {
  const [y, m, d] = dateStr.split('-').map((x) => Number(x));
  const start = new Date(y, m - 1, d, 8, 30, 0, 0);
  const end = new Date(y, m - 1, d, 15, 0, 0, 0);
  const slots = [];
  for (let t = new Date(start); t <= end; t = new Date(t.getTime() + 20 * 60 * 1000)) {
    slots.push(new Date(t));
  }
  return slots;
}

// POST /api/lab/:id/day-availability { date: 'YYYY-MM-DD', testTypes: [string] }
exports.setDayAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { date, testTypes } = req.body || {};
  if (!date) {
    res.status(400);
    throw new Error('date is required');
  }
  const lab = await Lab.findById(id);
  if (!lab) {
    res.status(404);
    throw new Error('Lab not found');
  }
  const idx = lab.dayAvailability.findIndex((d) => d.date === date);
  if (idx >= 0) {
    // Edit existing day: update test types only, preserve current slots (do not regenerate)
    if (Array.isArray(testTypes)) {
      lab.dayAvailability[idx].testTypes = testTypes;
    }
  } else {
    // First time configuring this day: set tests and generate the full slot grid
    const slots = generateDaySlots(date);
    lab.dayAvailability.push({ date, testTypes: Array.isArray(testTypes) ? testTypes : [], slots });
  }
  await lab.save();
  res.json(lab);
});

// GET /api/lab/:id/day-availability?date=YYYY-MM-DD
exports.getDayAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { date } = req.query || {};
  const lab = await Lab.findById(id);
  if (!lab) {
    res.status(404);
    throw new Error('Lab not found');
  }
  if (date) {
    const day = lab.dayAvailability.find((d) => d.date === date);
    return res.json(day || { date, testTypes: [], slots: [] });
  }
  res.json(lab.dayAvailability || []);
});

// GET /api/lab/search-availability?date=YYYY-MM-DD&testType=Name
exports.searchLabsByDateAndTest = asyncHandler(async (req, res) => {
  const { date, testType } = req.query || {};
  if (!date || !testType) {
    res.status(400);
    throw new Error('date and testType are required');
  }
  const labs = await Lab.find({ 'dayAvailability.date': date, 'dayAvailability.testTypes': testType }).lean();
  const results = labs.map((lab) => {
    const day = (lab.dayAvailability || []).find((d) => d.date === date && (d.testTypes || []).includes(testType));
    return {
      id: lab._id,
      name: lab.name,
      address: lab.address,
      slots: day?.slots || [],
    };
  }).filter((x) => (x.slots || []).length > 0);
  res.json(results);
});

// Patient schedules their lab request with a chosen lab and slot using PIN
exports.patientScheduleLab = asyncHandler(async (req, res) => {
  const { labRequestId } = req.params;
  const { labId, slot } = req.body;
  if (!labId || !slot) {
    res.status(400);
    throw new Error('labId and slot are required');
  }
  // Ensure the requester is the owner patient of this lab request
  const lrBefore = await LabRequest.findById(labRequestId);
  if (!lrBefore) {
    res.status(404);
    throw new Error('Lab request not found');
  }
  if (!req.user || String(req.user.role) !== 'patient') {
    res.status(401);
    throw new Error('Unauthorized');
  }
  if (String(lrBefore.patient) !== String(req.user.sub)) {
    res.status(403);
    throw new Error('You can only schedule your own lab requests');
  }
  const lab = await Lab.findById(labId);
  if (!lab) {
    res.status(404);
    throw new Error('Lab not found');
  }
  const slotDate = new Date(slot);
  // Verify slot belongs to dayAvailability and that test type is offered that day
  const y = slotDate.getFullYear();
  const m = String(slotDate.getMonth() + 1).padStart(2, '0');
  const d = String(slotDate.getDate()).padStart(2, '0');
  const dateStr = `${y}-${m}-${d}`;
  const day = lab.dayAvailability.find((d) => d.date === dateStr);
  if (!day) {
    res.status(400);
    throw new Error('No availability for the selected day');
  }
  if (!day.testTypes.includes(lrBefore.test)) {
    res.status(400);
    throw new Error('Required test type is not available on the selected day');
  }
  const exists = (day.slots || []).find((s) => new Date(s).getTime() === slotDate.getTime());
  if (!exists) {
    res.status(400);
    throw new Error('Selected slot is not available');
  }
  const lr = await LabRequest.findByIdAndUpdate(
    labRequestId,
    { status: 'Scheduled', scheduledAt: slotDate },
    { new: true }
  );
  if (!lr) {
    res.status(404);
    throw new Error('Lab request not found');
  }
  // Remove slot from lab dayAvailability to prevent double-booking
  day.slots = (day.slots || []).filter((s) => new Date(s).getTime() !== slotDate.getTime());
  lab.markModified('dayAvailability');
  await lab.save();
  res.json(lr);
});
