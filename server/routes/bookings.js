const express = require("express");
const router = express.Router();

router.get("/", (req,res)=>{
  res.json({message: "bookings route"});
});

router.get("/:studentId", (req,res)=>{
  res.json({message: "bookings studentId route"});
});

router.post("/webhook", (req,res)=>{
  res.json({received: true});
});

module.exports = router;