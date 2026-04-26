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

router.post("/webhook", (req,res)=>{
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

    return res.status(200).json({ received: true });

  }
  catch(error){
    console.error({ cause: error }, 'failed to verify cal webhook signature');
    return res.status(500).json({ message: 'Webhook verification failed' });
  }
  
});

module.exports = router;