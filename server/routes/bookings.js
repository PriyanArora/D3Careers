const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const Student = require("../models/Student");
const Alumni = require("../models/Alumni");
const MentorSession = require("../models/MentorSession");
const router = express.Router();
const { verifyWebhookSignature } = require("../controllers/bookingController");

router.get("/", (req,res)=>{
  res.json({message: "bookings route"});
});

router.get("/:studentId", authMiddleware, (req,res)=>{
  if(req.user.id !== req.params.studentId){
    return res.status(403).json({ message: 'Forbidden' })
  }
  res.json({message: "bookings studentId route"});
});

router.post("/webhook", async (req,res)=>{
  const payload = req.body;
  const signature = req.headers['x-cal-signature-256'];
  
  if (!signature) {
    return res.status(401).json({ message: 'Missing signature' });
  }

  try{
    const isValid = verifyWebhookSignature(payload, signature);

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const webhookData = JSON.parse(payload);
    const triggerEvent = webhookData.triggerEvent;
    const bookingUid = webhookData.payload?.uid;
    const scheduledAt = webhookData.payload?.startTime;
    const studentEmail = webhookData.payload?.attendees?.[0]?.email;
    const alumniId = webhookData.payload?.responses?.alumniId?.value;


    if (triggerEvent !== 'BOOKING_CREATED') {
      return res.status(200).json({ ignored: true });
    }

    if (!bookingUid) {
      return res.status(400).json({ message: 'Missing booking uid' });
    }

    if (!scheduledAt) {
      return res.status(400).json({ message: 'Missing start time' });
    }

    if (!studentEmail) {
      return res.status(400).json({ message: 'Missing student email' });
    }

    if (!alumniId) {
      return res.status(400).json({ message: 'Missing alumni id' });
    }

    const student = await Student.findOne({ email: studentEmail });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const alumni = await Alumni.findById(alumniId);

    if (!alumni) {
      return res.status(404).json({ message: 'Alumni not found' });
    }

    const existingSession = await MentorSession.findOne({ calEventUid: bookingUid });

    if (existingSession) {
      return res.status(200).json({ message: 'Session already exists' });
    }
    
    const mentorSession = new MentorSession({
      alumniId: alumni._id,
      studentId: student._id,
      calEventUid: bookingUid,
      scheduledAt,
    });

    await mentorSession.save();

    return res.status(201).json({ message: 'Mentor session created' });

  }
  catch(error){
    console.error({ cause: error }, 'failed to verify cal webhook signature');
    return res.status(500).json({ message: 'Webhook verification failed' });
  }

});

module.exports = router;
