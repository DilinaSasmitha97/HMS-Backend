const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    availability: { type: mongoose.Schema.Types.ObjectId, ref: 'DoctorAvailability' },
    datetime: { type: Date, required: true },
    payment: { type: String, enum: ['cash', 'card', 'insurance'], default: 'cash' },
    status: { type: String, enum: ['booked', 'completed', 'cancelled'], default: 'booked' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
