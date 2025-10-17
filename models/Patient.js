const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    contactNumber: { type: String, trim: true },
    address: { type: String, trim: true },
    // Hashed password for patient email/password login
    passwordHash: { type: String, select: false },
    // PIN used by doctors to access patient records; keep hidden by default
    pin: {
      type: String,
      required: true,
      trim: true,
      minlength: 4,
      maxlength: 8,
      unique: true,
      select: false,
    },
  },
  { timestamps: true }
);

// Ensure a unique index on PIN at the database level as well
patientSchema.index({ pin: 1 }, { unique: true });

module.exports = mongoose.model('Patient', patientSchema);
