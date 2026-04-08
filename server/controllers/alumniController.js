const Alumni = require("../models/Alumni.js");
const onlineAlumni = new Map();

const getAlumni = async(req,res) =>{
  const major = req.query.major;
  const background = req.query.background;
  const available = req.query.available;

  //default pagination: 1 for page, 20 for limit
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  //filter function for db
  try{
    const filter = {isProfileComplete: true};
    if(major){
      filter.major = major;
    }
    if(available){
      filter.isAvailableForMentorship = available;
    }
    if(background){
      filter.backgroundTags = background;
    }

    //parallel await of promises
    const [alumni, total] = await Promise.all([
      //ex. first page (1), skips 1-1*limit = 0. on 2nd page, skips 2-1*limit hence first 20
      Alumni.find(filter).skip((page-1)*limit).limit(limit),
      Alumni.countDocuments(filter)
    ]);
    
    if(req.user?.role === 'alumni'){
      onlineAlumni.set(req.user.id, Date.now());
    }

    res.json({alumni, total, page, totalPages: Math.ceil(total/limit)});
  }
  catch(err){
    console.error(`Failed to fetch alumni: ` ,{err});
    res.status(500).json({ error: "Failed to fetch alumni" });
  }
}

const getAlumniById = async(req,res) =>{
  const id = req.params.id;
  try{
    const alumni = await Alumni.findById(id);
    if(!alumni){
      return res.status(404).json({ error: 'Alumni not found' });
    }
    
    if(req.user?.role === 'alumni'){
      onlineAlumni.set(req.user.id, Date.now());
    }

    res.json(alumni);
  }
  catch(err){
    console.error(`Failed to fetch alumni by id: `,{err});
    res.status(500).json({ error: "Failed to fetch alumni by id" });
  }
}

const getOnlineAlumni = async(req,res) =>{
  //below converts map into array and sends it in json
  const now = Date.now();
  const activeIds = Array.from(onlineAlumni.entries())                                                                                                                                          
    .filter(([id, ts]) => now - ts < 60000)           
    .map(([id]) => id);                                                                                                                                                                         
  res.json(activeIds); 
}
  
const createAlumni = async(req,res) =>{
  try{
    const {name, email, passwordHash, role, major, currentRole, currentCompany, bio, backgroundTags, isAvailableForMentorship, isProfileComplete, careerTimeline } = req.body;
    const createdAlumni = await Alumni.create({name, email, passwordHash, role, major, currentRole, currentCompany, bio, backgroundTags, isAvailableForMentorship, isProfileComplete, careerTimeline});

    return res.status(201).json({alumni: createdAlumni});
  } 
  catch(err){
    console.error(`Failed to create alumni: `,{err});
    res.status(500).json({ error: "Failed to post/create alumni" });
  }
}


module.exports = {getAlumni, getAlumniById, getOnlineAlumni, createAlumni};