const mongoose = require('mongoose');

const LabTestRequestSchema = new mongoose.Schema({
    // ManyToOne to Patient and Doctor
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    requestingDoctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    testName: {
        type: String,
        required: true
    },
    urgency: { // IMMEDIATE or NORMAL
        type: String
    },
    status: { // PENDING, SCHEDULED, COMPLETED, CANCELLED
        type: String,
        default: 'PENDING'
    },
    scheduleDate: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('LabTestRequest', LabTestRequestSchema);