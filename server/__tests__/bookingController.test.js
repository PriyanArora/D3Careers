const {verifyWebhookSignature} = require("../controllers/bookingController.js")
const crypto = require("crypto");

process.env.CAL_WEBHOOK_SECRET = "testsecret";

//cal sends signautre as HMAC-SHA256 hex string, using crypto which is node's built in hashing function
describe("verifyWebhookSignature", ()=>{
  
  test("check if signature valid", ()=>{
    const secret = "testsecret";
    const payload = '{"event":"booking"}'
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');  //here using temp secret but env used for main, payload + hash(using secret) = signature --> ical and env will have same secret when hashed will give same signature, we cross check  
    
    const input = verifyWebhookSignature(payload, signature);

    expect(input).toBe(true);
  });

  test("check if signature invalid", ()=>{
    const secret = "testsecret";
    const payload = '{"event":"booking"}'
    const signature = "wrongSignature"
    
    const input = verifyWebhookSignature(payload, signature);
    
    expect(input).toBe(false);
  });

  test("check if signature missing", ()=>{
    const payload = '{"event":"booking"}'
    const signature = null
    
    const input = verifyWebhookSignature(payload, signature)

    expect(input).toBe(false)
  });

  test("throws if webhook secret is missing", () => {
    const originalSecret = process.env.CAL_WEBHOOK_SECRET;
    delete process.env.CAL_WEBHOOK_SECRET;

    expect(() => verifyWebhookSignature('{"event":"booking"}', "any-signature")).toThrow(
      "CAL_WEBHOOK_SECRET is not set."
    );

    process.env.CAL_WEBHOOK_SECRET = originalSecret;
  });
})