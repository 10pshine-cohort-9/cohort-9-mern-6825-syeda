const request = require("supertest");
const { expect } = require("chai");
const express = require("express");
const cookieParser = require("cookie-parser");
const { connectTestDB, closeTestDB, clearTestDB } = require("./setup");
const authRoutes = require("../routes/authRoutes");
const User = require("../models/User");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);

describe("Auth API", () => {
  before(async () => {
    await connectTestDB();
  });

  after(async () => {
    await closeTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  describe("POST /api/auth/register", () => {
    it("should return 400 if fields are missing", async () => {
      const res = await request(app).post("/api/auth/register").send({
        email: "test@example.com",
      });

      expect(res.status).to.equal(400);
      expect(res.body.message).to.include("Please provide");
    });

    it("should register a new user successfully", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("_id");
      expect(res.body.email).to.equal("test@example.com");
      expect(res.body).to.not.have.property("password");
    });

    it("should return 409 if email already exists", async () => {
      await User.create({
        name: "Existing User",
        email: "test@example.com",
        password: "password123",
      });

      const res = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      expect(res.status).to.equal(409);
      expect(res.body.message).to.include("already exists");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });
    });

    it("should return 400 if fields are missing", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
      });

      expect(res.status).to.equal(400);
    });

    it("should return 401 for wrong password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(res.status).to.equal(401);
      expect(res.body.message).to.include("Invalid email or password");
    });

    it("should return 401 for non-existent email", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "nobody@example.com",
        password: "password123",
      });

      expect(res.status).to.equal(401);
    });

    it("should login successfully and set a cookie", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(res.status).to.equal(200);
      expect(res.body.email).to.equal("test@example.com");
      expect(res.headers["set-cookie"]).to.not.be.undefined;
      expect(res.headers["set-cookie"][0]).to.include("token=");
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should clear the cookie and return 200", async () => {
      const res = await request(app).post("/api/auth/logout");

      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal("Logged out successfully");
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return 401 if no token is provided", async () => {
      const res = await request(app).get("/api/auth/me");

      expect(res.status).to.equal(401);
      expect(res.body.message).to.include("no token provided");
    });

    it("should return the user if a valid token is provided", async () => {
      await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      const loginRes = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      const cookie = loginRes.headers["set-cookie"];

      const res = await request(app).get("/api/auth/me").set("Cookie", cookie);

      expect(res.status).to.equal(200);
      expect(res.body.email).to.equal("test@example.com");
    });
  });
});