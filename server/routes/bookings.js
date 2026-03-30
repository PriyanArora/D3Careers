const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();

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
  res.json({received: true});
});

module.exports = router;