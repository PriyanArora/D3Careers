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
  
  //matchstage is for match stage in aggregation pipeline for if any filter passed in query such as major or background tags, we can give narrowed results
  const matchStage = {};                                                                                                                                                
  
  if(filters.major){
    matchStage.major = filters.major;
  }

  if(filters.background){
    matchStage.backgroundTags = filters.background;
  }

  //three stages in mongo aggregation pipeline, match for any filters provided in query, project to just get those first,second,third job, group groups those transitions

  const pipeline = [
    {$match: 
      matchStage
    },
    {$project: { 
      firstJob: {$arrayElemAt: ["$careerTimeline.title", 0] },
      secondJob: {$arrayElemAt: ["$careerTimeline.title", 1] },
      thirdJob: {$arrayElemAt: ["$careerTimeline.title", 2] },
    }},
    {$group:{
      _id: {source: "$firstJob", target: "$secondJob"},
      count: {$sum: 1},
    }},
    {$project: {
      source: "$_id.source",
      target: "$_id.target",
      count: "$count",
      _id: 0
    }},
  ];

  if(filters.depth != "2"){
    pipeline.push(
      {$unionWith: {
        coll: "alumni",
        pipeline: [
          {$match: 
            matchStage
          },
          {$project: { 
            firstJob: {$arrayElemAt: ["$careerTimeline.title", 0] },
            secondJob: {$arrayElemAt: ["$careerTimeline.title", 1] },
            thirdJob: {$arrayElemAt: ["$careerTimeline.title", 2] },
          }},
          {$group:{
            _id: {source: "$secondJob", target: "$thirdJob"},
            count: {$sum: 1},
          }},
          {$project: {
            source: "$_id.source",
            target: "$_id.target",
            count: "$count",
            _id: 0
          }},
        ]
      }},
    );
  }

  const results = await Alumni.aggregate(pipeline);
  return results;
}

module.exports = {buildSankeyShape, runAggregationPipeline};
