const express = require('express');
const { listPatients, createPatient, loginPatient, updatePatientPassword, lookupPatientByPin } = require('../controllers/patientController');
const { requireDoctor, requireAdmin: _requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', listPatients);
router.post('/', createPatient);
router.post('/login', loginPatient);
router.put('/:id/password', updatePatientPassword);
// Allow doctors to lookup by PIN; optionally admins as well
router.get('/lookup', requireDoctor, lookupPatientByPin);

module.exports = router;
