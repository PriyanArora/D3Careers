const request = require("supertest");
const {app} = require("../server.js");
jest.mock('../services/sankeyService', () => ({
    runAggregationPipeline: jest.fn().mockResolvedValue([]),
    buildSankeyShape: jest.fn().mockReturnValue({ nodes: [], links: [] }),
}));

describe("check is sankey service works (api and service)", ()=>{
  test("returns nodes and links arrays", async()=>{
    const response = await request(app).get("/api/pathways/sankey");
    expect(response.status).toBe(200);

    expect(response.body).toHaveProperty("nodes");
    expect(response.body).toHaveProperty("links");

  });
})

