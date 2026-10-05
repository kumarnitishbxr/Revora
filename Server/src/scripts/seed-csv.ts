import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "../config/db.js";

// Helper function to parse standard CSV
function parseCSV(content: string): Record<string, string>[] {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) return [];

  const headers = splitCSVLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header.trim()] = (values[index] || "").trim();
    });
    rows.push(row);
  }

  return rows;
}

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

async function run() {
  console.log("🚀 Starting CSV import into Revora database...");

  const dataDir = path.resolve(__dirname, "../../data");
  const usersCsvPath = path.join(dataDir, "users.csv");
  const storesCsvPath = path.join(dataDir, "stores.csv");
  const ratingsCsvPath = path.join(dataDir, "ratings.csv");

  // 1. Import Users
  if (fs.existsSync(usersCsvPath)) {
    console.log(`📄 Reading users from ${usersCsvPath}`);
    const usersData = parseCSV(fs.readFileSync(usersCsvPath, "utf-8"));

    for (const u of usersData) {
      if (!u.email || !u.name) continue;
      const role = (u.role as Role) || Role.NORMAL_USER;
      const password = u.password || "Password123!";
      const passwordHash = await bcrypt.hash(password, 10);

      const user = await prisma.user.upsert({
        where: { email: u.email },
        update: {
          name: u.name,
          address: u.address || "Revora Registered Address",
          role,
        },
        create: {
          name: u.name,
          email: u.email,
          passwordHash,
          address: u.address || "Revora Registered Address",
          role,
        },
      });

      console.log(`  ✓ User: ${user.name} (${user.email}) - ${user.role}`);
    }
  }

  // 2. Import Stores
  if (fs.existsSync(storesCsvPath)) {
    console.log(`📄 Reading stores from ${storesCsvPath}`);
    const storesData = parseCSV(fs.readFileSync(storesCsvPath, "utf-8"));

    for (const s of storesData) {
      if (!s.name || !s.email || !s.ownerEmail) continue;

      const owner = await prisma.user.findUnique({
        where: { email: s.ownerEmail },
      });

      if (!owner) {
        console.warn(`  ⚠️ Owner ${s.ownerEmail} not found for store ${s.name}`);
        continue;
      }

      const store = await prisma.store.upsert({
        where: { ownerId: owner.id },
        update: {
          name: s.name,
          email: s.email,
          address: s.address || "Revora Commercial Complex",
        },
        create: {
          name: s.name,
          email: s.email,
          address: s.address || "Revora Commercial Complex",
          ownerId: owner.id,
        },
      });

      console.log(`  ✓ Store: ${store.name} (Owner: ${owner.email})`);
    }
  }

  // 3. Import Ratings
  if (fs.existsSync(ratingsCsvPath)) {
    console.log(`📄 Reading ratings from ${ratingsCsvPath}`);
    const ratingsData = parseCSV(fs.readFileSync(ratingsCsvPath, "utf-8"));

    for (const r of ratingsData) {
      if (!r.userEmail || !r.storeEmail || !r.rating) continue;

      const user = await prisma.user.findUnique({
        where: { email: r.userEmail },
      });
      const store = await prisma.store.findFirst({
        where: { email: r.storeEmail },
      });

      if (!user || !store) {
        console.warn(`  ⚠️ Cannot match user (${r.userEmail}) or store (${r.storeEmail})`);
        continue;
      }

      const score = Math.max(1, Math.min(5, parseInt(r.rating, 10) || 5));

      const existingRating = await prisma.rating.findUnique({
        where: {
          userId_storeId: {
            userId: user.id,
            storeId: store.id,
          },
        },
      });

      if (existingRating) {
        await prisma.rating.update({
          where: { id: existingRating.id },
          data: { rating: score },
        });
        console.log(`  ✓ Updated Rating: ${user.name} -> ${store.name} (${score}★)`);
      } else {
        await prisma.rating.create({
          data: {
            userId: user.id,
            storeId: store.id,
            rating: score,
          },
        });
        console.log(`  ✓ Created Rating: ${user.name} -> ${store.name} (${score}★)`);
      }
    }
  }

  console.log("✨ All CSV files imported successfully!");
  await prisma.$disconnect();
}

run().catch((err) => {
  console.error("❌ CSV import failed:", err);
  process.exit(1);
});
