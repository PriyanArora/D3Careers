const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

if(!MONGO_URI){
  throw new Error("MONGO_URI is not set");
}

const connectDB = async() =>{
  try{
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");
  }
  catch(err){
    throw new Error("Error connecting to database", {cause: err});
  }
};

module.exports = connectDB;

//process.env doesnt need dotenv here but needs it in seed.js for populating dataset