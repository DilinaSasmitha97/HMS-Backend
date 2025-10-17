const Appointment = require('../models/Appointment');
const DoctorAvailability = require('../models/DoctorAvailability');
const asyncHandler = require('../utils/asyncHandler');

exports.listAppointments = asyncHandler(async (req, res) => {
  const { patientId, doctorId } = req.query;
  const filter = {};
  if (patientId) {
    filter.patient = patientId;
  }
  if (doctorId) {
    filter.doctor = doctorId;
  }
  const appts = await Appointment.find(filter)
    .populate('patient', 'name email')
    .populate('doctor', 'name specialty')
    .populate('hospital', 'name');
  res.json(appts);
});

exports.createAppointment = asyncHandler(async (req, res) => {
  const { patient, doctor, hospital, datetime, payment, availabilityId } = req.body;
  // If availabilityId is provided, enforce capacity rules
  let availability = null;
  if (availabilityId) {
    availability = await DoctorAvailability.findById(availabilityId);
    if (!availability) {
      res.status(400);
      throw new Error('Invalid availability');
    }
    if (String(availability.doctor) !== String(doctor) || String(availability.hospital) !== String(hospital)) {
      res.status(400);
      throw new Error('Availability does not match doctor or hospital');
    }
    const d = new Date(datetime);
    if (!(availability.start <= d && d <= availability.end)) {
      res.status(400);
      throw new Error('Appointment time is outside doctor availability');
    }
    const count = await Appointment.countDocuments({ availability: availability._id, status: { $ne: 'cancelled' } });
    if (count >= availability.capacity) {
      res.status(409);
      throw new Error('No remaining slots for this availability');
    }
  }
  const appt = await Appointment.create({ patient, doctor, hospital, availability: availability?._id, datetime, payment });
  res.status(201).json(appt);
});
