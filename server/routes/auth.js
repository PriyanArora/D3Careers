const express = require("express");
const router = express.Router();
const { registerStudent, registerAlumni, login } = require("../controllers/authController.js")
const {body, validationResult} = require("express-validator")

const validateStudent = [                                                                                                                                             
  body('name').notEmpty().withMessage('Name is required'),                                                                                                            
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
]

const validateAlumni = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
]

function checkValidation(req, res, next) {
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() })
  }
  next()
}

router.get("/", (req,res)=>{
  res.json({message: "auth route"});
});

router.post("/register/student", validateStudent, checkValidation, registerStudent);

router.post("/register/alumni", validateAlumni, checkValidation, registerAlumni);

router.post("/login", login);

module.exports = router;