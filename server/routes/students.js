const express = require("express");
const router = express.Router();

router.get("/", (req,res)=>{
  res.json({message: "students route"});
});

router.get("/:id/dashboard", (req,res)=>{
  res.json({message: "students id dashboard route"});
});

router.post("/:id/paths", (req,res)=>{
  res.json({message: "students id path route"});
});

router.post("/", (req,res)=>{
  res.json({id: "students post route"});
});

module.exports = router;