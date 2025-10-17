const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/jwt');

const sign = (payload) => signToken(payload);

exports.registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('email and password are required');
  }
  const exists = await Admin.findOne({ email });
  if (exists) {
    res.status(409);
    throw new Error('Admin already exists');
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await Admin.create({ name, email, passwordHash });
  res.status(201).json({ id: admin._id, email: admin.email });
});

exports.loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email }).select('+passwordHash');
  if (!admin) {
    res.status(401);
    throw new Error('Invalid credentials');
  }
  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) {
    res.status(401);
    throw new Error('Invalid credentials');
  }
  const token = sign({ sub: admin._id, role: 'admin' });
  res.json({ token, admin: { id: admin._id, email: admin.email, name: admin.name } });
});
