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

async function addColumnIfNotExists(tableName, columnName, columnDef) {
  const exists = await columnExists(tableName, columnName);
  if (!exists) {
    try {
      await client.execute(`ALTER TABLE "${tableName}" ADD COLUMN "${columnName}" ${columnDef}`);
      console.log(`✓ Added column ${tableName}.${columnName}`);
      return true;
    } catch (error) {
      console.error(`✗ Failed to add column ${columnName}: ${error.message}`);
      return false;
    }
  } else {
    console.log(`- Column ${tableName}.${columnName} already exists`);
    return false;
  }
}

console.log('Checking and adding missing columns...\n');

// Add columns if they don't exist
await addColumnIfNotExists('Order', 'orderNumber', 'TEXT');
await addColumnIfNotExists('Order', 'warrantyCardUrl', 'TEXT');
await addColumnIfNotExists('Order', 'invoiceUrl', 'TEXT');
await addColumnIfNotExists('Order', 'additionalFiles', 'TEXT');

// Populate orderNumber for existing orders
console.log('\nPopulating order numbers for existing orders...');
try {
  const result = await client.execute(`
    UPDATE "Order"
    SET "orderNumber" = (
        'ORD-' || 
        strftime('%Y', "createdAt") || 
        '-' || 
        printf('%03d', (
            SELECT COUNT(*)
            FROM "Order" o2
            WHERE strftime('%Y', o2."createdAt") = strftime('%Y', "Order"."createdAt")
            AND o2."createdAt" <= "Order"."createdAt"
        ))
    )
    WHERE "orderNumber" IS NULL OR "orderNumber" = ''
  `);
  console.log(`✓ Updated ${result.rowsAffected} orders with order numbers`);
} catch (error) {
  console.error(`✗ Failed to populate order numbers: ${error.message}`);
}

// Create unique index
console.log('\nCreating unique index on orderNumber...');
try {
  await client.execute(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderNumber_key" ON "Order"("orderNumber")
  `);
  console.log('✓ Index created');
} catch (error) {
  console.error(`✗ Failed to create index: ${error.message}`);
}

console.log('\n✓ Migration completed!');
await client.close();
