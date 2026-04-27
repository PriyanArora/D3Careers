const crypto = require("crypto");

const mockStudent = { findOne: jest.fn() };
const mockAlumni = { findOne: jest.fn() };

const mockMentorSession = jest.fn(function MentorSession(data) {
  this.alumniId = data.alumniId;
  this.studentId = data.studentId;
  this.calEventUid = data.calEventUid;
  this.scheduledAt = data.scheduledAt;
  this.save = jest.fn().mockResolvedValue(this);
});
mockMentorSession.findOne = jest.fn();

jest.mock("../models/Student", () => mockStudent);
jest.mock("../models/Alumni", () => mockAlumni);
jest.mock("../models/MentorSession", () => mockMentorSession);

const bookingsRouter = require("../routes/bookings");

process.env.CAL_WEBHOOK_SECRET = "testsecret";

function getWebhookHandler() {
  const webhookLayer = bookingsRouter.stack.find(
    (layer) => layer.route?.path === "/webhook" && layer.route?.methods?.post
  );

  return webhookLayer.route.stack[0].handle;
}

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

function signPayload(payload) {
  return crypto
    .createHmac("sha256", process.env.CAL_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");
}

function buildPayload(overrides = {}) {
  return JSON.stringify({
    triggerEvent: "BOOKING_CREATED",
    payload: {
      uid: "abc123",
      startTime: "2026-04-26T15:00:00.000Z",
      attendees: [{ email: "[email protected]" }],
      organizer: { email: "[email protected]" },
      ...overrides,
    },
  });
}

describe("POST /api/bookings/webhook", () => {
  const webhookHandler = getWebhookHandler();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns 401 when signature is missing", async () => {
    const req = {
      body: '{"event":"booking"}',
      headers: {},
    };
    const res = createResponse();

    await webhookHandler(req, res);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ message: "Missing signature" });
  });

  test("returns 401 when signature is invalid", async () => {
    const req = {
      body: '{"event":"booking"}',
      headers: {
        "x-cal-signature-256": "wrong-signature",
      },
    };
    const res = createResponse();

    await webhookHandler(req, res);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ message: "Invalid signature" });
  });

  test("returns 200 and ignores non-booking-created events", async () => {
    const payload = JSON.stringify({
      triggerEvent: "BOOKING_CANCELLED",
      payload: {
        uid: "abc123",
        startTime: "2026-04-26T15:00:00.000Z",
        attendees: [{ email: "[email protected]" }],
        organizer: { email: "[email protected]" },
      },
    });
    const req = {
      body: payload,
      headers: {
        "x-cal-signature-256": signPayload(payload),
      },
    };
    const res = createResponse();

    await webhookHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ignored: true });
  });

  test("returns 400 when booking uid is missing", async () => {
    const payload = buildPayload({ uid: undefined });
    const req = {
      body: payload,
      headers: {
        "x-cal-signature-256": signPayload(payload),
      },
    };
    const res = createResponse();

    await webhookHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: "Missing booking uid" });
  });

  test("returns 400 when start time is missing", async () => {
    const payload = buildPayload({ startTime: undefined });
    const req = {
      body: payload,
      headers: {
        "x-cal-signature-256": signPayload(payload),
      },
    };
    const res = createResponse();

    await webhookHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: "Missing start time" });
  });

  test("returns 400 when student email is missing", async () => {
    const payload = buildPayload({ attendees: [{}] });
    const req = {
      body: payload,
      headers: {
        "x-cal-signature-256": signPayload(payload),
      },
    };
    const res = createResponse();

    await webhookHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: "Missing student email" });
  });

  test("returns 400 when alumni email is missing", async () => {
    const payload = buildPayload({ organizer: {} });
    const req = {
      body: payload,
      headers: {
        "x-cal-signature-256": signPayload(payload),
      },
    };
    const res = createResponse();

    await webhookHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: "Missing alumni email" });
  });

  test("returns 404 when student is not found", async () => {
    mockStudent.findOne.mockResolvedValue(null);

    const payload = buildPayload();
    const req = {
      body: payload,
      headers: {
        "x-cal-signature-256": signPayload(payload),
      },
    };
    const res = createResponse();

    await webhookHandler(req, res);

    expect(mockStudent.findOne).toHaveBeenCalledWith({ email: "[email protected]" });
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: "Student not found" });
  });

  test("returns 404 when alumni is not found", async () => {
    mockStudent.findOne.mockResolvedValue({ _id: "student123" });
    mockAlumni.findOne.mockResolvedValue(null);

    const payload = buildPayload();
    const req = {
      body: payload,
      headers: {
        "x-cal-signature-256": signPayload(payload),
      },
    };
    const res = createResponse();

    await webhookHandler(req, res);

    expect(mockAlumni.findOne).toHaveBeenCalledWith({ email: "[email protected]" });
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: "Alumni not found" });
  });

  test("returns 200 when session already exists", async () => {
    mockStudent.findOne.mockResolvedValue({ _id: "student123" });
    mockAlumni.findOne.mockResolvedValue({ _id: "alumni123" });
    mockMentorSession.findOne.mockResolvedValue({ _id: "session123" });

    const payload = buildPayload();
    const req = {
      body: payload,
      headers: {
        "x-cal-signature-256": signPayload(payload),
      },
    };
    const res = createResponse();

    await webhookHandler(req, res);

    expect(mockMentorSession.findOne).toHaveBeenCalledWith({ calEventUid: "abc123" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Session already exists" });
  });

  test("returns 201 when mentor session is created", async () => {
    mockStudent.findOne.mockResolvedValue({ _id: "student123" });
    mockAlumni.findOne.mockResolvedValue({ _id: "alumni123" });
    mockMentorSession.findOne.mockResolvedValue(null);

    const payload = buildPayload();
    const req = {
      body: payload,
      headers: {
        "x-cal-signature-256": signPayload(payload),
      },
    };
    const res = createResponse();

    await webhookHandler(req, res);

    expect(mockMentorSession).toHaveBeenCalledWith({
      alumniId: "alumni123",
      studentId: "student123",
      calEventUid: "abc123",
      scheduledAt: "2026-04-26T15:00:00.000Z",
    });
    expect(mockMentorSession.mock.instances[0].save).toHaveBeenCalled();
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ message: "Mentor session created" });
  });

  test("returns 500 when payload parsing fails", async () => {
    const payload = '{"triggerEvent":"BOOKING_CREATED","payload":';
    const req = {
      body: payload,
      headers: {
        "x-cal-signature-256": signPayload(payload),
      },
    };
    const res = createResponse();

    await webhookHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ message: "Webhook verification failed" });
  });
});
