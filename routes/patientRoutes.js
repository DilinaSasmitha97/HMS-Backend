const express = require('express');
const router = express.Router();
const {
    createPatient,
    getPatients
} = require('../controllers/patientController');

// Defines the GET and POST routes for the base path /api/patients
router.route('/')
    .get(getPatients) // Handles GET /api/patients (Read all)
    .post(createPatient); // Handles POST /api/patients (Create new)

// If you need to read a single patient by ID, you'd add:
// router.route('/:id').get(getPatientById); 

module.exports = router;