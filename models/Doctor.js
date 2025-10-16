const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    specialization: {
        type: String,
        trim: true
    },
    contactNumber: {
        type: String,
        trim: true
    },
    // ManyToOne to Hospital
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Doctor', DoctorSchema);