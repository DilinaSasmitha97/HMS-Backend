const request = require('supertest');
const app = require('../app');
const Patient = require('../models/Patient');

afterAll(() => {});

describe('Records', () => {
  test('List requires patientId and create works', async () => {
    const p = await Patient.create({ name: 'RP', email: 'rp@x.com', pin: '8888' });
    await request(app).get('/api/records').expect(400);
    const created = await request(app)
      .post('/api/records')
      .send({ patient: p._id, type: 'note', summary: 'S', data: { k: 'v' } })
      .expect(201);
    const list = await request(app).get('/api/records').query({ patientId: p._id.toString() }).expect(200);
    expect(list.body.length).toBe(1);
  });
});
