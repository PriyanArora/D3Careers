const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mentorSession = new Schema({
  alumniId: {
    type: Schema.Types.ObjectId,
    ref: 'Alumni',
    required: true,
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  calEventUid: {
    type: String,
    required: true,
    unique: true,
  },
  scheduledAt: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed',
  },
}, {timestamps: true});

const session = mongoose.model("MentorSession", mentorSession);
module.exports = session;