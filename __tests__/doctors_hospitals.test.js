const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../app');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const { signToken } = require('../utils/jwt');

afterAll(() => {});

describe('Hospitals and Doctors', () => {
  test('Create and list hospital', async () => {
    await request(app).post('/api/hospitals').send({ name: 'H1', address: 'A' }).expect(201);
    const res = await request(app).get('/api/hospitals').expect(200);
    expect(res.body.find((h) => h.name === 'H1')).toBeTruthy();
  });

  test('Create doctor, login, and create availability (protected)', async () => {
    const hospital = await Hospital.create({ name: 'H2' });
    const passwordHash = await bcrypt.hash('secret12', 10);
    const doc = await Doctor.create({ name: 'Dr X', email: 'drx@x.com', passwordHash, hospital: hospital._id });
    const login = await request(app).post('/api/doctors/login').send({ email: 'drx@x.com', password: 'secret12' }).expect(200);
    const token = login.body.token;
    const start = new Date(Date.now() + 3600_000).toISOString();
    const end = new Date(Date.now() + 7200_000).toISOString();
    const avail = await request(app)
      .post('/api/doctors/availability')
      .set('Authorization', `Bearer ${token}`)
      .send({ doctorId: doc._id.toString(), hospitalId: hospital._id.toString(), start, end, capacity: 3 })
      .expect(201);
    expect(avail.body.capacity).toBe(3);
    const list = await request(app).get('/api/doctors/availability').query({ doctorId: doc._id.toString() }).expect(200);
    expect(Array.isArray(list.body)).toBe(true);
  });
});
