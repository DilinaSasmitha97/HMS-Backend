const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
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
    appointmentDate: {
        type: Date,
        required: true
    },
    timeSlot: { // Use String for time or combine with appointmentDate as a single Date type
        type: String
    },
    status: { // CONFIRMED, PENDING_PAYMENT, CANCELLED
        type: String,
        default: 'PENDING_PAYMENT'
    },
    paymentStatus: { // PAID, CASH, PENDING
        type: String,
        default: 'PENDING'
    },
    referenceId: {
        type: String
    },
    fee: {
        type: Number,
        default: 0.0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Appointment', AppointmentSchema);