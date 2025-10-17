const Patient = require('../models/Patient');

// @desc    Create a new patient
// @route   POST /api/patients
// @access  Public
const createPatient = async (req, res) => {
    try {
        // Destructure fields from the request body
        const {
            name,
            email,
            contactNumber,
            address,
            medicalRecordPin,
            qrCodeData
        } = req.body;

        // Check if a patient with the given email already exists (based on unique constraint)
        const patientExists = await Patient.findOne({ email });
        
        if (patientExists) {
            return res.status(400).json({ message: 'Patient with this email already exists' });
        }

        // Create a new patient instance
        const patient = new Patient({
            name,
            email,
            contactNumber,
            address,
            medicalRecordPin, // *NOTE: In a real app, hash this before saving*
            qrCodeData
        });

        // Save the patient to the database
        const createdPatient = await patient.save();
        
        // Respond with the newly created patient object
        res.status(201).json(createdPatient);
    } catch (error) {
        // Handle validation errors or server errors
        res.status(500).json({ 
            message: 'Server Error or Validation Failed', 
            error: error.message 
        });
    }
};

// @desc    Get all patients
// @route   GET /api/patients
// @access  Public
const getPatients = async (req, res) => {
    try {
        // Find all patients and exclude the sensitive PIN field from the response
        const patients = await Patient.find({}).select('-medicalRecordPin'); 
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createPatient,
    getPatients,
};