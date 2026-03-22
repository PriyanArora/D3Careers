const express = require("express");
const router = express.Router();

router.get("/", (req,res)=>{
  res.json({message: "alumni route"});
});

router.get("/online", (req,res)=>{
  res.json({message: "alumni online route"});
});

router.get("/:id", (req,res)=>{
  res.json({message: "alumni id route"});
});

router.get("/:id/sessions", (req,res)=>{
  res.json({message: "alumni id session route"});
});

router.post("/", (req,res)=>{
  res.json({id: "alumni post route"});
});






module.exports = router;