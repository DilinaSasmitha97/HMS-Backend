require('dotenv').config();
const _mongoose = require('mongoose');
const connectDB = require('../config/db');
const Patient = require('../models/Patient');
const Record = require('../models/Record');

(async () => {
  try {
    await connectDB();
    const email = process.argv[2];
    if (!email) {
      console.error('Usage: node scripts/seedLabResult.js <patientEmail>');
      process.exit(1);
    }
    const p = await Patient.findOne({ email: String(email).toLowerCase().trim() });
    if (!p) {
      console.error('Patient not found for email:', email);
      process.exit(1);
    }
    const rec = await Record.create({
      patient: p._id,
      type: 'lab',
      summary: 'CBC result: Normal limits',
      data: {
        test: 'Complete Blood Count (CBC)',
        results: {
          WBC: '6.1 x10^9/L',
          RBC: '4.8 x10^12/L',
          Hemoglobin: '14.2 g/dL',
          Hematocrit: '42%',
          Platelets: '230 x10^9/L',
        },
      },
    });
    console.log('Inserted lab record:', rec._id.toString());
    process.exit(0);
  } catch (e) {
    console.error('Error seeding lab result:', e.message);
    process.exit(1);
  }
})();
