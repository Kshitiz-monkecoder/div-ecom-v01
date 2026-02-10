import { createClient } from '@libsql/client';

const dbUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!dbUrl || !authToken) {
  console.error('Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in environment');
  process.exit(1);
}

const client = createClient({
  url: dbUrl,
  authToken: authToken,
});

async function columnExists(tableName, columnName) {
  try {
    const result = await client.execute(
      `SELECT name FROM pragma_table_info('${tableName}') WHERE name = ?`,
      [columnName]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error(`Error checking column: ${error.message}`);
    return false;
  }
}

console.log('Checking and adding subCategories column to Ticket table...\n');

const exists = await columnExists('Ticket', 'subCategories');

if (!exists) {
  try {
    await client.execute(`ALTER TABLE "Ticket" ADD COLUMN "subCategories" TEXT`);
    console.log('✓ Added Ticket.subCategories column');
  } catch (error) {
    console.error(`✗ Failed to add column: ${error.message}`);
    process.exit(1);
  }
} else {
  console.log('- Ticket.subCategories column already exists');
}

console.log('\n✓ Migration completed!');
await client.close();
