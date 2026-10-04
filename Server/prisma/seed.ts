import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in .env");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting idempotent database seeding...");

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // 1. Upsert SYSTEM_ADMIN
  const admin = await prisma.user.upsert({
    where: { email: "admin@revora.com" },
    update: {
      name: "System Administrator Account",
      role: Role.SYSTEM_ADMIN,
      passwordHash,
      address: "100 Admin Corporate Plaza, Suite 400, Tech City",
    },
    create: {
      name: "System Administrator Account",
      email: "admin@revora.com",
      passwordHash,
      address: "100 Admin Corporate Plaza, Suite 400, Tech City",
      role: Role.SYSTEM_ADMIN,
    },
  });

  // 2. Upsert STORE_OWNER
  const owner = await prisma.user.upsert({
    where: { email: "owner@revora.com" },
    update: {
      name: "Store Owner Representative",
      role: Role.STORE_OWNER,
      passwordHash,
      address: "12 Commerce Boulevard, Downtown Central",
    },
    create: {
      name: "Store Owner Representative",
      email: "owner@revora.com",
      passwordHash,
      address: "12 Commerce Boulevard, Downtown Central",
      role: Role.STORE_OWNER,
    },
  });

  // 3. Upsert NORMAL_USER
  const user = await prisma.user.upsert({
    where: { email: "user@revora.com" },
    update: {
      name: "Normal Customer Representative",
      role: Role.NORMAL_USER,
      passwordHash,
      address: "78 Residential Avenue, Suburbia Heights",
    },
    create: {
      name: "Normal Customer Representative",
      email: "user@revora.com",
      passwordHash,
      address: "78 Residential Avenue, Suburbia Heights",
      role: Role.NORMAL_USER,
    },
  });

  // 4. Upsert Store
  const store = await prisma.store.upsert({
    where: { ownerId: owner.id },
    update: {
      name: "Revora Organic Market",
      email: "contact@revoramarket.com",
      address: "12 Commerce Boulevard, Floor 1, Downtown Central",
    },
    create: {
      name: "Revora Organic Market",
      email: "contact@revoramarket.com",
      address: "12 Commerce Boulevard, Floor 1, Downtown Central",
      ownerId: owner.id,
    },
  });

  // 5. Upsert Rating
  await prisma.rating.upsert({
    where: {
      userId_storeId: {
        userId: user.id,
        storeId: store.id,
      },
    },
    update: {
      rating: 5,
    },
    create: {
      rating: 5,
      userId: user.id,
      storeId: store.id,
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log("------------------------------------------");
  console.log("Admin:  admin@revora.com  | Password123!");
  console.log("Owner:  owner@revora.com  | Password123!");
  console.log("User:   user@revora.com   | Password123!");
  console.log("------------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
