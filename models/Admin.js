const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, default: 'admin' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admin', adminSchema);
