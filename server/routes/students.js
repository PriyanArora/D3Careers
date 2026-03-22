const express = require("express");
const { createStudent, getStudentDashboard } = require("../controllers/studentController.js");
const router = express.Router();

router.get("/", (req,res)=>{
  res.json({message: "students route"});
});

router.get("/:id/dashboard", getStudentDashboard);

router.post("/:id/paths", (req,res)=>{
  res.json({message: "students id path route"});
});

router.post("/", createStudent);

module.exports = router;