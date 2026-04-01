const express = require("express");
const { getAlumni, getAlumniById, getOnlineAlumni, createAlumni } = require("../controllers/alumniController.js");
const router = express.Router();
const {authMiddleware, optionalAuth} = require("../middleware/authMiddleware.js")

router.get("/", optionalAuth, getAlumni);

router.get("/online", getOnlineAlumni);

router.get("/:id", optionalAuth, getAlumniById);

router.get("/:id/sessions", authMiddleware, (req,res)=>{
  if(req.user.id !== req.params.id){
    return res.status(403).json({ message: 'Forbidden' })
  }
  res.json({message: "alumni id session route"});
});

router.post("/", authMiddleware, createAlumni);






module.exports = router;