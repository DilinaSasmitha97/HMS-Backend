const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    specialty: { type: String, trim: true },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
    email: { type: String, lowercase: true, trim: true, unique: true, sparse: true },
    passwordHash: { type: String, select: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
