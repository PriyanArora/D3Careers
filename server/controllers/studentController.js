const Student = require("../models/Student.js");

const createStudent = async(req,res) =>{
  try{
    const {name, email, passwordHash, backgroundTags} = req.body;
    const newStudent = await Student.create({name, email, passwordHash, backgroundTags});
    //succesful creation returns 201
    return res.status(201).json({student: newStudent});
  }
  catch(err){
    console.error(`Failed to create student: `,{err});
    res.status(500).json({ error: "Failed to post/create student" });
  }
};

const getStudentDashboard = async(req,res) =>{
  try{
    const id = req.params.id;
    const student = await Student.findById(id);

    if(!student){
      //404 is resource not found
      res.status(404).json({error: "student with id not found"});
    }
    else{
      //succesful get returns 200
      res.status(200).json(student);
    }
  }
  catch(err){
    console.error(`Failed to get student dashboard using id: `,{err});
    res.status(500).json({ error: "Failed to get student dashboard using id" });
  }
};

module.exports = {createStudent, getStudentDashboard};