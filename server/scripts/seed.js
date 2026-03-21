require('dotenv').config();

//dotenv must be before any process.env reads
const connectDB = require("../db.js");

const Alumni = require("../models/Alumni.js");
const mongoose = require("mongoose");
const data = require("./RefinedKaggleDataset_800_people.json");


const seedingData = async() =>{
  try{
    await connectDB();
    await Alumni.deleteMany({});
    const numInserted = await Alumni.insertMany(data);
    console.log(`${numInserted.length} Alumni inserted succesfully`);
    await mongoose.disconnect();
  }
  catch(err){
    throw new Error("Error with db: ", {cause:err});
  }
};

seedingData();