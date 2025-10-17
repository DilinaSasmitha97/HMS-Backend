const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../app');
const Patient = require('../models/Patient');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const DoctorAvailability = require('../models/DoctorAvailability');
const Appointment = require('../models/Appointment');
const { signToken } = require('../utils/jwt');

afterAll(() => {});

describe('Appointments', () => {
  test('Create appointment with availability capacity enforcement', async () => {
    const patient = await Patient.create({ name: 'P1', email: 'p1@x.com', pin: '2222' });
    const hospital = await Hospital.create({ name: 'H3' });
    const passwordHash = await bcrypt.hash('dsecret', 10);
    const doctor = await Doctor.create({ name: 'D1', email: 'd1@x.com', passwordHash, hospital: hospital._id });
    const now = Date.now();
    const start = new Date(now + 3600_000);
    const end = new Date(now + 7200_000);
    const availability = await DoctorAvailability.create({ doctor: doctor._id, hospital: hospital._id, start, end, capacity: 1 });
    // First booking succeeds
    await request(app)
      .post('/api/appointments')
      .send({ patient: patient._id, doctor: doctor._id, hospital: hospital._id, datetime: new Date(now + 4000_000).toISOString(), availabilityId: availability._id })
      .expect(201);
    // Second booking fails due to capacity
    await request(app)
      .post('/api/appointments')
      .send({ patient: patient._id, doctor: doctor._id, hospital: hospital._id, datetime: new Date(now + 4500_000).toISOString(), availabilityId: availability._id })
      .expect(409);
  });
});
