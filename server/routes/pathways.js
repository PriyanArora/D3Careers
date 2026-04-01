const express = require("express");
const {buildSankeyShape, runAggregationPipeline} = require("../services/sankeyService.js");
const router = express.Router();
const {optionalAuth} = require("../middleware/authMiddleware.js");

router.get("/", (req,res)=>{
  res.json({message: "pathways route"});
});

router.get("/sankey", optionalAuth, async(req,res)=>{
  try{
    const major = req.query.major;
    const background = req.query.background;
    const depth = req.query.depth;

    const aggregated = await runAggregationPipeline({major, background, depth});
    const results = buildSankeyShape(aggregated);
    res.json(results);
  }
  catch(error){
    res.status(500).json({ message: "Aggrgeation pipeline failed" });
  }
});

module.exports = router;