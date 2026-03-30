const express = require("express");
const { createStudent, getStudentDashboard } = require("../controllers/studentController.js");
const router = express.Router();
const {authMiddleware} = require("../middleware/authMiddleware.js")

router.get("/", (req,res)=>{
  res.json({message: "students route"});
});

router.get("/:id/dashboard", authMiddleware, getStudentDashboard);

router.post("/:id/paths", authMiddleware, (req,res)=>{
  if(req.user.id !== req.params.id){
    return res.status(403).json({ message: 'Forbidden' })
  }
  res.json({message: "students id path route"});
});

router.post("/", createStudent);

router.delete("/:id/paths/:pathId", authMiddleware, (req,res)=>{
  if(req.user.id !== req.params.id){
    return res.status(403).json({ message: 'Forbidden' })
  }
  res.json({message: 'path deleted'})
})

module.exports = router;