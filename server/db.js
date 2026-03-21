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
  catch(error){
    console.error("Connection failed to mongo: ", error);
    process.exit(1);
  }
}

module.exports = connectDB;