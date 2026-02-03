import "dotenv/config";
import { config } from "dotenv";
import { readFileSync } from "fs";

config({ path: ".env.local" });
import { join } from "path";
import { prisma } from "../lib/prisma";

/**
 * Seed products from a JSON file.
 * Run after migration: bun run scripts/seed-products.ts
 *
 * Usage:
 *   bun run scripts/seed-products.ts
 *   bun run scripts/seed-products.ts --file ./path/to/Product.json
 *   PRODUCT_JSON_PATH=./path/to/Product.json bun run scripts/seed-products.ts
 *
 * Default file: scripts/seed-products.json
 */

type ProductJson = {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: string;
  category: string;
  images: string;
  isActive: number;
  createdAt: string;
};

async function main() {
  const fileArg = process.argv.find((a) => a.startsWith("--file="));
  const filePath =
    fileArg?.split("=")[1] ||
    process.env.PRODUCT_JSON_PATH ||
    join(process.cwd(), "scripts", "seed-products.json");

  console.log(`\n📦 Seeding products from: ${filePath}\n`);

  let raw: string;
  try {
    raw = readFileSync(filePath, "utf-8");
  } catch {
    console.error(`❌ Could not read file: ${filePath}`);
    console.error("Copy Product.json to scripts/seed-products.json or pass --file=/path/to/Product.json");
    process.exit(1);
  }

  let products: ProductJson[];
  try {
    products = JSON.parse(raw);
  } catch {
    console.error("❌ Invalid JSON in product file");
    process.exit(1);
  }

  if (!Array.isArray(products) || products.length === 0) {
    console.error("❌ Product file must be a non-empty JSON array");
    process.exit(1);
  }

  const data = products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    capacity: p.capacity,
    category: p.category,
    images: typeof p.images === "string" ? p.images : JSON.stringify(p.images ?? []),
    isActive: Boolean(p.isActive),
    createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
  }));

  try {
    const result = await prisma.product.createMany({
      data,
    });
    console.log(`✅ Seeded ${result.count} product(s)`);
  } catch (error) {
    console.error("❌ Seed failed:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
