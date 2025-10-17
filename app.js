const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic root route for server status check
app.get('/', (req, res) => {
  res.send('Hospital Management System MERN Backend is running!');
});

// API routes
app.use('/api/hospitals', require('./routes/hospitalRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/records', require('./routes/recordRoutes'));
app.use('/api/lab', require('./routes/labRoutes'));
app.use('/api/lab', require('./routes/labManagementRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

// Errors
const { notFound, errorHandler } = require('./middleware/error');
app.use(notFound);
app.use(errorHandler);

module.exports = app;
