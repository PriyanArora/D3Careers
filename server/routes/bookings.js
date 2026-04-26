const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
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

router.post("/webhook", express.text({ type: "application/json" }), (req,res)=>{
  const payload = req.body;
  const signature = req.headers['x-cal-signature-256'];
  
  const isValid = verifyWebhookSignature(payload, signature);

  if (!isValid) {
    return res.status(401).json({ message: 'Invalid signature' });
  }

  res.status(200).json({ received: true });
});

module.exports = router;