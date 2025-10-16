const mongoose = require('mongoose');

const DoctorNoteSchema = new mongoose.Schema({
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
    dateCreated: {
        type: Date,
        default: Date.now
    },
    assessment: { // @Lob field
        type: String
    },
    plan: { // @Lob field
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('DoctorNote', DoctorNoteSchema);