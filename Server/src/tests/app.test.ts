import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import app from "../app";
import { prisma, pool } from "../config/db";

describe("REVORA - Full Integration & Security Tests", () => {
  let adminToken: string;
  let userToken: string;
  let ownerToken: string;
  let testStoreId: number;

  afterAll(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

  describe("1. Health Check", () => {
    it("GET /api/health - should verify database connectivity and return 200", async () => {
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.database).toBe("connected");
    });
  });

  describe("2. Authentication & Validation", () => {
    it("POST /api/auth/login - should authenticate seeded SYSTEM_ADMIN", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "admin@revora.com",
        password: "Password123!",
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe("SYSTEM_ADMIN");
      adminToken = res.body.data.token;
    });

    it("POST /api/auth/login - should authenticate seeded NORMAL_USER", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "user@revora.com",
        password: "Password123!",
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe("NORMAL_USER");
      userToken = res.body.data.token;
    });

    it("POST /api/auth/login - should authenticate seeded STORE_OWNER", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "owner@revora.com",
        password: "Password123!",
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe("STORE_OWNER");
      ownerToken = res.body.data.token;
    });

    it("POST /api/auth/login - should fail with 401 on incorrect password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "admin@revora.com",
        password: "WrongPassword!",
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("POST /api/auth/register - should enforce min 20 char name and valid password", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Short Name", // < 20 chars
        email: "invalid@example.com",
        password: "weak", // < 8 chars, no special char
        address: "Some address",
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it("POST /api/auth/register - should register a new NORMAL_USER with valid data", async () => {
      const randomSuffix = Date.now();
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "New Registered Customer Person", // 30 chars
          email: `newcustomer${randomSuffix}@revora.com`,
          password: "Password123!",
          address: "456 Greenfield Boulevard, Sector 9",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe("NORMAL_USER");
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    it("GET /api/auth/me - should return authenticated profile", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe("user@revora.com");
    });

    it("GET /api/auth/me - should return 401 without token", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
    });

    it("PATCH /api/auth/password - should change password when current password is valid", async () => {
      const res = await request(app)
        .patch("/api/auth/password")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          currentPassword: "Password123!",
          newPassword: "NewPass123!",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Revert back for other tests
      await request(app)
        .patch("/api/auth/password")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          currentPassword: "NewPass123!",
          newPassword: "Password123!",
        });
    });
  });

  describe("3. Role-Based Authorization & Dashboard", () => {
    it("GET /api/admin/dashboard - should allow SYSTEM_ADMIN", async () => {
      const res = await request(app)
        .get("/api/admin/dashboard")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalUsers).toBeGreaterThan(0);
      expect(res.body.data.totalStores).toBeGreaterThan(0);
    });

    it("GET /api/admin/dashboard - should forbid NORMAL_USER with 403", async () => {
      const res = await request(app)
        .get("/api/admin/dashboard")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it("GET /api/store-owner/dashboard - should allow STORE_OWNER and return store metrics", async () => {
      const res = await request(app)
        .get("/api/store-owner/dashboard")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.store).toBeDefined();
      expect(res.body.data.ratingUsers).toBeDefined();
    });

    it("GET /api/store-owner/dashboard - should forbid NORMAL_USER with 403", async () => {
      const res = await request(app)
        .get("/api/store-owner/dashboard")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("4. Store Management & Listings", () => {
    it("POST /api/admin/stores - should allow SYSTEM_ADMIN to create a new store", async () => {
      // First create a new store owner via admin
      const ownerRes = await request(app)
        .post("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Second Store Owner Representative",
          email: `owner2_${Date.now()}@revora.com`,
          password: "Password123!",
          address: "50 Industrial Zone, South Hub",
          role: "STORE_OWNER",
        });

      const newOwnerId = ownerRes.body.data.user.id;

      const res = await request(app)
        .post("/api/admin/stores")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Revora Fresh Superstore",
          email: `superstore_${Date.now()}@revora.com`,
          address: "88 Commercial Drive, Downtown District",
          ownerId: newOwnerId,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.store.name).toBe("Revora Fresh Superstore");
      testStoreId = res.body.data.store.id;
    });

    it("GET /api/stores - should list stores with overallRating and pagination", async () => {
      const res = await request(app).get("/api/stores?page=1&limit=10");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });

    it("GET /api/stores - should support search by name and address", async () => {
      const res = await request(app).get("/api/stores?search=Commercial");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("GET /api/stores/:id - should return single store details", async () => {
      const res = await request(app).get(`/api/stores/${testStoreId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(testStoreId);
    });
  });

  describe("5. Store Ratings & Integrity Rules", () => {
    it("POST /api/stores/:storeId/rating - should allow NORMAL_USER to submit rating 1-5", async () => {
      const res = await request(app)
        .post(`/api/stores/${testStoreId}/rating`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ rating: 4 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rating.rating).toBe(4);
      expect(res.body.data.averageRating).toBe(4);
    });

    it("POST /api/stores/:storeId/rating - should prevent duplicate rating with 409 Conflict", async () => {
      const res = await request(app)
        .post(`/api/stores/${testStoreId}/rating`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ rating: 5 });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it("PATCH /api/stores/:storeId/rating - should allow user to update their existing rating", async () => {
      const res = await request(app)
        .patch(`/api/stores/${testStoreId}/rating`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ rating: 5 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rating.rating).toBe(5);
    });

    it("POST /api/stores/:storeId/rating - should reject invalid rating (> 5) with 400", async () => {
      const res = await request(app)
        .post(`/api/stores/${testStoreId}/rating`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ rating: 10 });

      expect(res.status).toBe(400);
    });

    it("GET /api/stores/:storeId/rating - should return calculated rating summary and user's rating", async () => {
      const res = await request(app)
        .get(`/api/stores/${testStoreId}/rating`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.userRating).toBe(5);
      expect(res.body.data.averageRating).toBe(5);
    });
  });
});
