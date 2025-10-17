const mongoose = require('mongoose');

const doctorAvailabilitySchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    capacity: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DoctorAvailability', doctorAvailabilitySchema);
