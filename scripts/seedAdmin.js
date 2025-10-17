require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const Admin = require('../models/Admin');

(async () => {
  try {
    await connectDB();
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.SEED_ADMIN_PASSWORD || 'StrongPass123!';
    const name = process.env.SEED_ADMIN_NAME || 'Super Admin';

    let admin = await Admin.findOne({ email }).select('+passwordHash');
    if (!admin) {
      const passwordHash = await bcrypt.hash(password, 10);
      admin = await Admin.create({ name, email, passwordHash });
      console.log('Admin created:', { id: admin._id.toString(), email });
    } else {
      console.log('Admin already exists:', { id: admin._id.toString(), email });
    }
    console.log('Use these credentials to login:', { email, password });
  } catch (e) {
    console.error('Seed admin failed:', e.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
})();
