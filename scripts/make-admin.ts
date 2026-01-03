import { prisma } from "../lib/prisma";

/**
 * Script to make a user an admin
 * Usage: bun run scripts/make-admin.ts <user-email>
 */

async function makeAdmin(email: string) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
    });

    console.log(`✅ User ${user.email} is now an ADMIN`);
    return user;
  } catch (error) {
    if (error instanceof Error && error.message.includes("Record to update does not exist")) {
      console.error(`❌ User with email "${email}" not found.`);
      console.error("Make sure the user has signed in at least once (so they exist in the database).");
    } else {
      console.error("Error:", error);
    }
    process.exit(1);
  }
}

const email = process.argv[2];

if (!email) {
  console.error("Usage: bun run scripts/make-admin.ts <user-email>");
  console.error("Example: bun run scripts/make-admin.ts admin@example.com");
  process.exit(1);
}

makeAdmin(email)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

