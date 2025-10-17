const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Admin = require('../models/Admin');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Lab = require('../models/Lab');
const bcrypt = require('bcryptjs');

afterAll(() => {});

describe('Auth flows', () => {
  test('Admin register and login', async () => {
    const email = 'admin@example.com';
    const password = 'StrongP@ss1';
    await request(app).post('/api/auth/admin/register').send({ name: 'A', email, password }).expect(201);
    const res = await request(app).post('/api/auth/admin/login').send({ email, password }).expect(200);
    expect(res.body.token).toBeTruthy();
  });

  test('Doctor login issues JWT', async () => {
    const password = await bcrypt.hash('secret123', 10);
    const doc = await Doctor.create({ name: 'D', email: 'd@x.com', passwordHash: password });
    const res = await request(app).post('/api/doctors/login').send({ email: doc.email, password: 'secret123' }).expect(200);
    expect(res.body.token).toBeTruthy();
  });

  test('Patient login issues JWT', async () => {
    const password = await bcrypt.hash('psecret', 10);
    await Patient.create({ name: 'P', email: 'p@x.com', passwordHash: password, pin: '1234' });
    const res = await request(app).post('/api/patients/login').send({ email: 'p@x.com', password: 'psecret' }).expect(200);
    expect(res.body.token).toBeTruthy();
  });

  test('Lab login issues JWT', async () => {
    const password = await bcrypt.hash('lsecret', 10);
    await Lab.create({ name: 'L', email: 'l@x.com', passwordHash: password });
    const res = await request(app).post('/api/lab/login').send({ email: 'l@x.com', password: 'lsecret' }).expect(200);
    expect(res.body.token).toBeTruthy();
  });
});
