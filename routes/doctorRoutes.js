const express = require('express');
const { listDoctors, createDoctor, loginDoctor, createAvailability, listAvailability } = require('../controllers/doctorController');
const { requireDoctor } = require('../middleware/auth');
const router = express.Router();

router.get('/', listDoctors);
router.post('/', createDoctor);
router.post('/login', loginDoctor);
router.post('/availability', requireDoctor, createAvailability);
router.get('/availability', listAvailability);

module.exports = router;
