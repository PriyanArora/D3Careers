const Alumni = require("../models/Alumni.js");

function buildSankeyShape(rows){
  const names = new Set();

  for(const row of rows){
    if(row.source != null){
      names.add(row.source);
    }
    if(row.target != null){
      names.add(row.target);
    }
  }

  const nodes = Array.from(names, (name)=>({name}));
  
  const links = rows
    .filter((row)=> row.source != null && row.target != null && row.count != null)
    .map((row) => ({
      source: row.source,
      target: row.target,
      value: row.count,
    }));

  return {nodes, links};
}

async function runAggregationPipeline(filters){

  const matchStage = {};

  if(filters.major){
    matchStage.major = filters.major;
  }

  if(filters.background){
    matchStage.backgroundTags = filters.background;
  }

  // run three separate queries and merge results in Node
  const project = {
    major: "$major",
    firstJob: {$arrayElemAt: ["$careerTimeline.title", 0]},
    secondJob: {$arrayElemAt: ["$careerTimeline.title", 1]},
    thirdJob: {$arrayElemAt: ["$careerTimeline.title", 2]},
  }

  // query 1: major to firstJob
  const majorToFirst = await Alumni.aggregate([
    {$match: matchStage},
    {$project: project},
    {$group: {_id: {source: "$major", target: "$firstJob"}, count: {$sum: 1}}},
    {$project: {source: "$_id.source", target: "$_id.target", count: "$count", _id: 0}},
  ])

  // query 2: firstJob to secondJob
  const firstToSecond = await Alumni.aggregate([
    {$match: matchStage},
    {$project: project},
    {$group: {_id: {source: "$firstJob", target: "$secondJob"}, count: {$sum: 1}}},
    {$project: {source: "$_id.source", target: "$_id.target", count: "$count", _id: 0}},
  ])

  // query 3: secondJob to thirdJob (only if depth != 2)
  let secondToThird = []
  if(filters.depth !== "2"){
    secondToThird = await Alumni.aggregate([
      {$match: matchStage},
      {$project: project},
      {$group: {_id: {source: "$secondJob", target: "$thirdJob"}, count: {$sum: 1}}},
      {$project: {source: "$_id.source", target: "$_id.target", count: "$count", _id: 0}},
    ])
  }

  return [...majorToFirst, ...firstToSecond, ...secondToThird]
}

module.exports = {buildSankeyShape, runAggregationPipeline};