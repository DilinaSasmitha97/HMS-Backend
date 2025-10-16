const mongoose = require('mongoose');

const LabReportSchema = new mongoose.Schema({
    // OneToOne reference to LabTestRequest
    request: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LabTestRequest',
        required: true,
        unique: true // Ensures only one report per request
    },
    // ManyToOne to Patient
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    dateCompleted: {
        type: Date,
        default: Date.now
    },
    resultsFilePath: {
        type: String
    },
    summary: { // @Lob field
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('LabReport', LabReportSchema);