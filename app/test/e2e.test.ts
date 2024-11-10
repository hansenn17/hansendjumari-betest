import request from "supertest";
import mongoose from "mongoose";
import app from "../../index";
import UserModel from "../model/user.model";
import jwt from "jsonwebtoken";
import { User } from "../type/user";

describe("User API", () => {
  let token: string = "";

  beforeAll(async () => {
    token = jwt.sign(
      { id: "test-id" },
      process.env.JWT_ACCESS_SECRET_KEY || "secret-key"
    );
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await UserModel.deleteMany({});
  });

  describe("POST /api/user", () => {
    it("should create a new user", async () => {
      const userData: User = {
        username: "Test User",
        accountNumber: "123456",
        emailAddress: "test@example.com",
        identityNumber: "ID123456",
      };

      const response = await request(app)
        .post("/api/user")
        .set("Authorization", `Bearer ${token}`)
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.username).toBe(userData.username);
    });
  });

  describe("GET /api/user/account/:accountNumber", () => {
    it("should get user by account number", async () => {
      const user: User = await UserModel.create({
        username: "Test User",
        accountNumber: "123456",
        emailAddress: "test@example.com",
        identityNumber: "ID123456",
      });

      const response = await request(app)
        .get(`/api/user/account/${user.accountNumber}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.accountNumber).toBe(user.accountNumber);
    });
  });

  describe("GET /api/user/identity/:identityNumber", () => {
    it("should get user by identity number", async () => {
      const user: User = await UserModel.create({
        username: "Test User",
        accountNumber: "123456",
        emailAddress: "test@example.com",
        identityNumber: "ID123456",
      });

      const response = await request(app)
        .get(`/api/user/identity/${user.identityNumber}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.identityNumber).toBe(user.identityNumber);
    });
  });

  describe("PUT /api/user/:id", () => {
    it("should update user data", async () => {
      const userData: User = {
        username: "Test User",
        accountNumber: "123456",
        emailAddress: "test@example.com",
        identityNumber: "ID123456",
      };

      const user = new UserModel(userData);
      await user.save();

      const response = await request(app)
        .put(`/api/user/${user._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ emailAddress: "updated@example.com" });

      expect(response.status).toBe(200);
      expect(response.body.emailAddress).toBe("updated@example.com");
    });
  });

  describe("DELETE /api/user/:id", () => {
    it("should delete a user", async () => {
      const userData: User = {
        username: "Test User",
        accountNumber: "123456",
        emailAddress: "test@example.com",
        identityNumber: "ID123456",
      };

      const user = new UserModel(userData);
      await user.save();

      const response = await request(app)
        .delete(`/api/user/${user._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ emailAddress: "updated@example.com" });

      expect(response.status).toBe(200);
    });
  });
});

describe("Auth API", () => {
  describe("POST /api/auth/token", () => {
    it("should generate token", async () => {
      const response = await request(app).post("/api/auth/token");

      expect(response.status).toBe(200);
    });
  });
});
