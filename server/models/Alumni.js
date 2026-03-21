const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const alumniSchema = new Schema({
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
    enum: ['alumni'],
    default: 'alumni'
  },
  major: String,
  currentRole: String,
  currentCompany: String,
  bio: String,
  backgroundTags: {
    type: [String],
    enum:['firstGen', 'transfer', 'international'],
  },
  isAvailableForMentorship: {
    type: Boolean,
    default: true,
  },
  isProfileComplete: {
    type: Boolean,
    default: false,
  },
  careerTimeline:[{
    title: {
      type:String,
      required: true,
    },
    company: String,
    industry: String,
    startYear: Number,
    endYear: Number,
    skillsGained: [String],
    adviceForSelf: String,
  }],
}, {timestamps: true});

const alumni = mongoose.model("Alumni", alumniSchema);
module.exports = alumni;
