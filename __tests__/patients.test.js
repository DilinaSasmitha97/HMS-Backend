const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../app');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const { signToken } = require('../utils/jwt');

afterAll(() => {});

describe('Patients API', () => {
  test('Create patient and list includes it', async () => {
    const payload = { name: 'Pat', email: 'pat@x.com', pin: '5678', contactNumber: '111' };
    await request(app).post('/api/patients').send(payload).expect(201);
    const res = await request(app).get('/api/patients').expect(200);
    const found = res.body.find((p) => p.email === payload.email);
    expect(found).toBeTruthy();
    expect(found.pin).toBeTruthy(); // list includes pin for admin context per controller comment
  });

  test('Patient login returns token', async () => {
    const passwordHash = await bcrypt.hash('p123456', 10);
    await Patient.create({ name: 'PP', email: 'pp@x.com', passwordHash, pin: '1111' });
    const res = await request(app).post('/api/patients/login').send({ email: 'pp@x.com', password: 'p123456' }).expect(200);
    expect(res.body.token).toBeTruthy();
  });

  test('Lookup patient by pin requires doctor role', async () => {
    const p = await Patient.create({ name: 'LP', email: 'lp@x.com', pin: '9999' });
    const doc = await Doctor.create({ name: 'Doc', email: 'doc@x.com' });
    const token = signToken({ sub: doc._id, role: 'doctor' });
    const res = await request(app)
      .get('/api/patients/lookup')
      .query({ pin: '9999' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body.email).toBe('lp@x.com');
  });
});
