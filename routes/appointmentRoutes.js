const express = require('express');
const { listAppointments, createAppointment } = require('../controllers/appointmentController');
const router = express.Router();

router.get('/', listAppointments);
router.post('/', createAppointment);

module.exports = router;
