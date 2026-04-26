const request = require("supertest");
const crypto = require("crypto");
const { app } = require("../server");

process.env.CAL_WEBHOOK_SECRET = "testsecret";

describe("POST /api/bookings/webhook", () => {
    test("returns 401 when signature is missing", async () => {
        const response = await request(app)
        .post("/api/bookings/webhook")
        .set("Content-Type", "application/json")
        .send('{"event":"booking"}');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: "Missing signature" });
    });

    test("returns 401 when signature is invalid", async () => {
      const response = await request(app)
        .post("/api/bookings/webhook")
        .set("Content-Type", "application/json")
        .set("x-cal-signature-256", "wrong-signature")
        .send('{"event":"booking"}');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Invalid signature" });
    });

    test("returns 200 when signature is valid", async () => {
      const payload = '{"event":"booking"}';
      const signature = crypto
        .createHmac("sha256", process.env.CAL_WEBHOOK_SECRET)
        .update(payload)
        .digest("hex");

      const response = await request(app)
        .post("/api/bookings/webhook")
        .set("Content-Type", "application/json")
        .set("x-cal-signature-256", signature)
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ received: true });
    });
});