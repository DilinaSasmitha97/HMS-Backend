const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../app');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Lab = require('../models/Lab');
const LabRequest = require('../models/LabRequest');
const { signToken } = require('../utils/jwt');

afterAll(() => {});

describe('Lab requests and management', () => {
  test('Create lab request, verify PIN, and complete', async () => {
    const p = await Patient.create({ name: 'P', email: 'p@lab.com', pin: '4444' });
    const d = await Doctor.create({ name: 'D' });
    const create = await request(app).post('/api/lab/requests').send({ patient: p._id, orderedBy: d._id, test: 'CBC', urgency: 'Normal' }).expect(201);
    const id = create.body._id;
    await request(app).post(`/api/lab/requests/${id}/verify-pin`).send({ pin: '4444' }).expect(200);
    // App requires status to be 'Scheduled' before completion
    await LabRequest.findByIdAndUpdate(id, { status: 'Scheduled' });
    const done = await request(app).patch(`/api/lab/requests/${id}/complete`).send({ pin: '4444', results: { WBC: 'OK' } }).expect(200);
    expect(done.body.request.status).toBe('Completed');
  });

  test('Lab day availability create + patient schedules via token', async () => {
    const passwordHash = await bcrypt.hash('lpass', 10);
    const lab = await Lab.create({ name: 'LabA', email: 'lab@x.com', passwordHash });
    const labLogin = await request(app).post('/api/lab/login').send({ email: 'lab@x.com', password: 'lpass' }).expect(200);
    const labToken = labLogin.body.token;

    const p = await Patient.create({ name: 'PP', email: 'pp@lab.com', pin: '1212' });
    const d = await Doctor.create({ name: 'Dr Lab' });
    const lr = await LabRequest.create({ patient: p._id, orderedBy: d._id, test: 'Lipid Profile', urgency: 'Normal' });

    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const dStr = String(today.getDate()).padStart(2, '0');
    const date = `${y}-${m}-${dStr}`;

    await request(app)
      .post(`/api/lab/labs/${lab._id}/day-availability`)
      .set('Authorization', `Bearer ${labToken}`)
      .send({ date, testTypes: ['Lipid Profile'] })
      .expect(200);

    const get = await request(app)
      .get(`/api/lab/labs/${lab._id}/day-availability`)
      .set('Authorization', `Bearer ${labToken}`)
      .query({ date })
      .expect(200);
    const slot = get.body.slots[0];
    expect(slot).toBeTruthy();

    // patient schedules with patient token
    const patientToken = signToken({ sub: p._id, role: 'patient' });
    await request(app)
      .post(`/api/lab/requests/${lr._id}/schedule-by-patient`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ labId: lab._id, slot })
      .expect(200);
  });
});
