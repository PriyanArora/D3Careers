const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')                                                                                                                                   
const Student = require('../models/Student.js')                                                                                                                       
const Alumni = require('../models/Alumni.js')

function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

async function registerStudent(req,res){
  try{
    const {name, email, password} = req.body
    const existing = await Student.findOne({ email })
    
    if(existing){
      return res.status(409).json({ message: 'Email already registered' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const student = await Student.create({ name, email, passwordHash })

    const token = generateToken(student)
    res.status(201).json({token, user: {id: student._id, name:student.name, role: student.role}})
  }
  catch(error){
    res.status(500).json({ message: 'Registration failed', cause: error.message })
  }
}

async function registerAlumni(req, res) {
  try {
    const { name, email, password } = req.body

    const existing = await Alumni.findOne({ email })

    if(existing){
      return res.status(409).json({ message: 'Email already registered' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const alumni = await Alumni.create({ name, email, passwordHash })

    const token = generateToken(alumni)

    res.status(201).json({ token, user: { id: alumni._id, name: alumni.name, role: alumni.role } })
  } 
  catch(error){
    res.status(500).json({ message: 'Registration failed', cause: error.message })
  }
}

async function login(req,res) {
  try{
    const {email, password} = req.body

    //store user as student, if null then try storing it in alumni, if not both then send 401 invalid creds 
    let user = await Student.findOne({email})
    if(!user){
      user = await Alumni.findOne({ email })
    }

    if(!user){
      return res.status(401).json({message: 'No account registered under this email'})
    }

    const match = await bcrypt.compare(password, user.passwordHash)
    if(!match){
      return res.status(401).json({message: 'Invalid credentials'})
    }

    const token = generateToken(user)
    res.json({token, user: {id: user._id, name: user.name, role: user.role} })
  }
  catch(error){
    res.status(500).json({message: 'Login failed', cause: error.message})
  }
}

module.exports = { registerStudent, registerAlumni, login }