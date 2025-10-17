const mongoose = require('mongoose');

const labSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    // Email + password for lab login
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    passwordHash: { type: String, select: false },
    // Backwards-compatible flat slots list (kept for existing flows)
    availableSlots: { type: [Date], default: [] },
  // Day-based availability: each entry contains a date string (YYYY-MM-DD),
  // the offered test types (store human-readable names to match LabRequest.test),
  // and the generated 20-min slots between 08:30 and 15:00 for that day.
    dayAvailability: [
      {
        date: { type: String, required: true },
        testTypes: { type: [String], default: [] },
        slots: { type: [Date], default: [] },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lab', labSchema);
