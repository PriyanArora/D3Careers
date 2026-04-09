const Alumni = require("../models/Alumni.js");
const onlineAlumni = new Map();
const allowedBackgroundTags = new Set(['firstGen', 'transfer', 'international'])

const getAlumni = async(req,res) =>{
  const major = req.query.major;
  const background = req.query.background;
  const available = req.query.available;

  //default pagination: 1 for page, 20 for limit
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  //filter function for db
  try{
    const filter = { isProfileComplete: true };
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
      Alumni.find(filter).sort({ updatedAt: -1, createdAt: -1 }).skip((page-1)*limit).limit(limit),
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
    if (req.user.role !== 'alumni') {
      return res.status(403).json({ error: 'Only alumni can complete alumni profiles' })
    }

    const {
      major,
      currentRole,
      currentCompany,
      bio,
      backgroundTags,
      isAvailableForMentorship,
      careerTimeline,
    } = req.body

    const normalizedMajor = typeof major === 'string' ? major.trim() : ''
    const normalizedCurrentRole = typeof currentRole === 'string' ? currentRole.trim() : ''
    const normalizedCurrentCompany = typeof currentCompany === 'string' ? currentCompany.trim() : ''
    const normalizedBio = typeof bio === 'string' ? bio.trim() : ''

    if (!normalizedMajor || !normalizedCurrentRole || !normalizedCurrentCompany || !normalizedBio) {
      return res.status(400).json({
        error: 'major, currentRole, currentCompany, and bio are required',
      })
    }

    const normalizedTimeline = (Array.isArray(careerTimeline) ? careerTimeline : [])
      .map((job) => {
        const title = typeof job?.title === 'string' ? job.title.trim() : ''
        const company = typeof job?.company === 'string' ? job.company.trim() : ''
        const industry = typeof job?.industry === 'string' ? job.industry.trim() : ''
        const adviceForSelf = typeof job?.adviceForSelf === 'string' ? job.adviceForSelf.trim() : ''
        const startYear = job?.startYear ? Number(job.startYear) : undefined
        const endYear = job?.endYear ? Number(job.endYear) : undefined
        const skillsGained = Array.isArray(job?.skillsGained)
          ? job.skillsGained
            .map((skill) => (typeof skill === 'string' ? skill.trim() : ''))
            .filter(Boolean)
          : []

        const hasContent = Boolean(title || company || industry || adviceForSelf || startYear || endYear || skillsGained.length)
        if (!hasContent) {
          return null
        }

        if (!title) {
          return { invalid: true }
        }

        return {
          title,
          company,
          industry,
          startYear,
          endYear,
          skillsGained,
          adviceForSelf,
        }
      })
      .filter(Boolean)

    if (normalizedTimeline.some((job) => job.invalid)) {
      return res.status(400).json({ error: 'Every job entry with content must include a title' })
    }

    if (normalizedTimeline.length === 0) {
      normalizedTimeline.push({
        title: normalizedCurrentRole,
        company: normalizedCurrentCompany,
        startYear: new Date().getFullYear(),
        endYear: null,
        adviceForSelf: normalizedBio,
      })
    }

    const normalizedBackgroundTags = Array.isArray(backgroundTags)
      ? backgroundTags.filter((tag) => allowedBackgroundTags.has(tag))
      : []

    const updatedAlumni = await Alumni.findByIdAndUpdate(
      req.user.id,
      {
        major: normalizedMajor,
        currentRole: normalizedCurrentRole,
        currentCompany: normalizedCurrentCompany,
        bio: normalizedBio,
        backgroundTags: normalizedBackgroundTags,
        isAvailableForMentorship: typeof isAvailableForMentorship === 'boolean' ? isAvailableForMentorship : true,
        careerTimeline: normalizedTimeline,
        isProfileComplete: true,
      },
      { new: true, runValidators: true },
    )

    if (!updatedAlumni) {
      return res.status(404).json({ error: 'Alumni not found' })
    }

    return res.status(200).json({alumni: updatedAlumni});
  } 
  catch(err){
    console.error(`Failed to create alumni: `,{err});
    res.status(500).json({ error: "Failed to post/create alumni" });
  }
}


module.exports = {getAlumni, getAlumniById, getOnlineAlumni, createAlumni};