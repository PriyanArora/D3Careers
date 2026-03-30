const jwt = require("jsonwebtoken")

function authMiddleware(req,res,next){
  //axios attaches headers with frotnend request which is in format Authorisation: bearer dingdongetc....
  const header = req.headers.authorization
  if(!header || !header.startsWith('Bearer ')){
    return res.status(401).json({message: 'No token provided or invalid format of toekn'})
  }

  //getting just the token by doing the split
  const token = header.split(' ')[1]

  try{
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  }
  catch(error){
    res.status(401).json({message: 'Invalid or expired token'})
  }
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization
  if(header && header.startsWith('Bearer ')){
    const token = header.split(' ')[1]
    try{
      req.user = jwt.verify(token, process.env.JWT_SECRET) //if token exisits, login like authmiddlware func
    } 
    catch{
      // invalid token , we ignore, treat as guest on public routes like sankey and alumni browse
    }
  }
  next() //always continues
}

module.exports = { authMiddleware, optionalAuth }
