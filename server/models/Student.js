const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const studentSchema = new Schema({
  name: {
    type:String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  //passwordHash will store hashed bcrypt'ed passwords
  passwordHash: {
    type:String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student'],
    default: 'student'
  },
  major: String,
  backgroundTags: {
    type: [String],
    enum:['firstGen', 'transfer', 'international'],
  },
  savedPaths: [{
    label: String,
    savedAt: Date,
    filters: {
      major: String,
      background: String,
      depth: String,
    },
  }],
}, {timestamps: true});

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
