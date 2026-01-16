import { prisma } from "../lib/prisma";
import { Role } from "@prisma/client";

/**
 * Script to make a user an admin by phone number
 * Usage: bun run scripts/make-admin.ts <phone-number>
 * 
 * You can also pass multiple phone numbers:
 * bun run scripts/make-admin.ts 9876543210 9876543211
 */

function cleanPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  return phone.replace(/\D/g, "");
}

async function makeAdmin(phone: string) {
  const cleanPhone = cleanPhoneNumber(phone);

  if (cleanPhone.length !== 10) {
    console.error(`❌ Invalid phone number: ${phone}`);
    console.error("Phone number must be 10 digits");
    return null;
  }

  try {
    // Try to find existing user
    let user = await prisma.user.findUnique({
      where: { phone: cleanPhone },
    });

    if (user) {
      // Update existing user to admin
      user = await prisma.user.update({
        where: { phone: cleanPhone },
        data: { role: Role.ADMIN },
      });
      console.log(`✅ User ${user.name} (${user.phone}) is now an ADMIN`);
    } else {
      // Create new user as admin
      user = await prisma.user.create({
        data: {
          phone: cleanPhone,
          name: `Admin ${cleanPhone}`,
          role: Role.ADMIN,
        },
      });
      console.log(`✅ Created new admin user: ${user.name} (${user.phone})`);
    }

    return user;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ Error: ${error.message}`);
    } else {
      console.error("❌ Unknown error:", error);
    }
    return null;
  }
}

async function main() {
  const phoneNumbers = process.argv.slice(2);

  if (phoneNumbers.length === 0) {
    console.error("Usage: bun run scripts/make-admin.ts <phone-number> [phone-number2] [phone-number3] ...");
    console.error("Example: bun run scripts/make-admin.ts 9876543210");
    console.error("Example: bun run scripts/make-admin.ts 9876543210 9876543211 9876543212");
    process.exit(1);
  }

  console.log(`\n📱 Making ${phoneNumbers.length} user(s) admin...\n`);

  const results = await Promise.all(
    phoneNumbers.map(async (phone) => {
      return await makeAdmin(phone);
    })
  );

  const successCount = results.filter((r) => r !== null).length;
  const failCount = results.length - successCount;

  console.log(`\n📊 Summary: ${successCount} succeeded, ${failCount} failed\n`);

  if (failCount > 0) {
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

