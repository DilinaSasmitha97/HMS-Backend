const mongoose = require('mongoose');

const labRequestSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    orderedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    test: { type: String, required: true },
    urgency: { type: String, enum: ['Normal', 'Urgent'], default: 'Normal' },
    status: { type: String, enum: ['Pending', 'Scheduled', 'Completed'], default: 'Pending' },
    scheduledAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LabRequest', labRequestSchema);
