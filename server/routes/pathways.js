const express = require("express");
const router = express.Router();

router.get("/", (req,res)=>{
  res.json({message: "pathways route"});
});

router.get("/sankey", (req,res)=>{
  res.json({nodes: [], links:[]});
});

module.exports = router;