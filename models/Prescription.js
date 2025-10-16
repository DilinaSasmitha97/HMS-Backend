const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
    // ManyToOne to Patient and Doctor
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    dateIssued: {
        type: Date,
        default: Date.now
    },
    medications: { // @Lob field
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Prescription', PrescriptionSchema);