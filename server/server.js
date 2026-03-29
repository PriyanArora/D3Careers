require('dotenv').config();

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const connectDB = require("./db.js");

const MONGO_URI = process.env.MONGO_URI;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;
//fallback default port to 5000
const PORT = process.env.PORT || 5000;

if(!MONGO_URI){
  throw new Error("MONGO_URI is not set in .env");
}

if(!CLIENT_ORIGIN){
  throw new Error("CLIENT_ORIGIN is not set in .env");
}

const app = express();

//middleware checkpoints
app.use(express.json());
app.use(cors({origin: CLIENT_ORIGIN}));

const authLimiter = rateLimit({
  windowMs: 15*60*1000, //15 mins
  max: 20,
});

app.use("/api/auth", authLimiter);

app.get("/api/health", (req,res) =>{
  res.json({status: "ok", timestamp: new Date()});
});

//routers
app.use("/api/alumni", require("./routes/alumni.js"));
app.use("/api/auth", require("./routes/auth.js"));
app.use("/api/bookings", require("./routes/bookings.js"));
app.use("/api/pathways", require("./routes/pathways.js"));
app.use("/api/students", require("./routes/students.js"));

const startServer = async() =>{
  try{
    await connectDB();
    app.listen(PORT, ()=>{
      console.info({port: PORT}, " : Server started");
    });
  }
  catch(err){
    console.error("Failed to start server :", {cause: err});
    process.exit(1);
  }
}

startServer();

module.exports = {app};

