const express = require("express");
const { getAlumni, getAlumniById, getOnlineAlumni, createAlumni } = require("../controllers/alumniController.js");
const router = express.Router();

router.get("/", getAlumni);

router.get("/online", getOnlineAlumni);

router.get("/:id", getAlumniById);

router.get("/:id/sessions", (req,res)=>{
  res.json({message: "alumni id session route"});
});

router.post("/", createAlumni);






module.exports = router;