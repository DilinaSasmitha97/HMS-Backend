const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    type: { type: String, enum: ['note', 'prescription', 'lab'], required: true },
    summary: { type: String },
    data: { type: mongoose.Schema.Types.Mixed },
    pinProtected: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Record', recordSchema);
