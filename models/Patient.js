const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    contactNumber: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    medicalRecordPin: { // Critical for security feature (should be hashed)
        type: String,
        required: true
    },
    qrCodeData: {
        type: String
    }
    // OneToMany appointments relationship is handled by querying the Appointment model
}, {
    timestamps: true
});

module.exports = mongoose.model('Patient', PatientSchema);