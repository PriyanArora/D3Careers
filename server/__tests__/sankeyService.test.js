const {buildSankeyShape} = require("../services/sankeyService");

describe("buildSankeyShape", ()=>{
  test("returns nodes and links arrays",()=>{
    const input = [ {source: "Software Engineer", target: "Senior Engineer", count:42 } ];
    
    const result = buildSankeyShape(input);
    
    expect(result).toHaveProperty("nodes");
    expect(result).toHaveProperty("links");
    expect(Array.isArray(result.nodes)).toBe(true);
    expect(Array.isArray(result.links)).toBe(true);
  });

  test("result links 0 has source target and value", ()=>{
    const input = [ {source: "Software Engineer", target: "Senior Engineer", count:42 } ];
    
    const result = buildSankeyShape(input);

    expect(result.links[0]).toHaveProperty("source");
    expect(result.links[0]).toHaveProperty("target");
    expect(result.links[0]).toHaveProperty("value");
  });

  test("check if deduplicates nodes happen correctly", ()=>{
    const input = [ 
      { source: "Software Engineer", target: "Senior Engineer", count: 42 },
      { source: "Senior Engineer",   target: "Tech Lead",       count: 25 },
    ];
    
    const result = buildSankeyShape(input);

    expect(result.nodes.length).toBe(3);
  });
})