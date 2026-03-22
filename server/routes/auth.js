const express = require("express");
const router = express.Router();

router.get("/", (req,res)=>{
  res.json({message: "auth route"});
});

router.post("/register/student", (req,res)=>{
  res.json({token: "temp JWT token"});
});

router.post("/register/alumni", (req,res)=>{
  res.json({token: "temp JWT token"});
});

module.exports = router;